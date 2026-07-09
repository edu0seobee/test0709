import { supabase } from "./client";
import type { ChecklistItem, ExtractedFields, NoticeCard } from "@/lib/types/notice";

interface ChecklistItemRow {
  id: string;
  notice_id: string;
  label: string;
  checked: boolean;
  added_manually: boolean;
  position: number;
}

interface NoticeRow {
  id: string;
  created_at: string;
  updated_at: string;
  source_file_name: string;
  raw_lines: string[];
  extracted: ExtractedFields;
  user_notes: string | null;
  checklist_items?: ChecklistItemRow[];
}

function rowToChecklistItem(row: ChecklistItemRow): ChecklistItem {
  return {
    id: row.id,
    label: row.label,
    checked: row.checked,
    addedManually: row.added_manually,
  };
}

function rowToNoticeCard(row: NoticeRow): NoticeCard {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    sourceFileName: row.source_file_name,
    rawLines: row.raw_lines ?? [],
    extracted: row.extracted,
    checklist: (row.checklist_items ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(rowToChecklistItem),
    userNotes: row.user_notes ?? undefined,
  };
}

export async function fetchNotices(): Promise<NoticeCard[]> {
  const { data, error } = await supabase
    .from("notices")
    .select("*, checklist_items(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToNoticeCard);
}

export async function insertNotice(input: {
  sourceFileName: string;
  rawLines: string[];
  extracted: ExtractedFields;
  checklistLabels: string[];
}): Promise<NoticeCard> {
  const { data: noticeRow, error } = await supabase
    .from("notices")
    .insert({
      source_file_name: input.sourceFileName,
      raw_lines: input.rawLines,
      extracted: input.extracted,
    })
    .select()
    .single();

  if (error) throw error;

  let checklistRows: ChecklistItemRow[] = [];
  if (input.checklistLabels.length > 0) {
    const { data, error: checklistError } = await supabase
      .from("checklist_items")
      .insert(
        input.checklistLabels.map((label, index) => ({
          notice_id: noticeRow.id,
          label,
          position: index,
        })),
      )
      .select();

    if (checklistError) throw checklistError;
    checklistRows = data ?? [];
  }

  return rowToNoticeCard({ ...noticeRow, checklist_items: checklistRows });
}

export async function updateNoticeFields(
  id: string,
  patch: { extracted?: ExtractedFields; userNotes?: string },
): Promise<void> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.extracted) payload.extracted = patch.extracted;
  if (patch.userNotes !== undefined) payload.user_notes = patch.userNotes;

  const { error } = await supabase.from("notices").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteNotice(id: string): Promise<void> {
  const { error } = await supabase.from("notices").delete().eq("id", id);
  if (error) throw error;
}

export async function setChecklistItemChecked(
  itemId: string,
  checked: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("checklist_items")
    .update({ checked })
    .eq("id", itemId);
  if (error) throw error;
}

export async function insertChecklistItem(
  noticeId: string,
  label: string,
  position: number,
): Promise<ChecklistItem> {
  const { data, error } = await supabase
    .from("checklist_items")
    .insert({ notice_id: noticeId, label, added_manually: true, position })
    .select()
    .single();

  if (error) throw error;
  return rowToChecklistItem(data);
}

export async function deleteChecklistItem(itemId: string): Promise<void> {
  const { error } = await supabase.from("checklist_items").delete().eq("id", itemId);
  if (error) throw error;
}
