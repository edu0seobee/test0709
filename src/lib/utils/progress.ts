import type { ChecklistItem } from "@/lib/types/notice";

export function calcProgress(checklist: ChecklistItem[]): number {
  if (checklist.length === 0) return 0;
  const checked = checklist.filter((item) => item.checked).length;
  return (checked / checklist.length) * 100;
}
