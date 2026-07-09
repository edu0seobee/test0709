import { useEffect } from "react";
import { create } from "zustand";
import * as noticesApi from "@/lib/supabase/notices";
import { showToast } from "@/lib/utils/toast";
import type { NoticeCard } from "@/lib/types/notice";

type LoadStatus = "idle" | "loading" | "loaded" | "error";

interface NoticeStoreState {
  notices: NoticeCard[];
  status: LoadStatus;
  fetchNotices: () => Promise<void>;
  addNotice: (draft: NoticeCard) => Promise<NoticeCard | null>;
  updateNotice: (id: string, patch: Partial<NoticeCard>) => void;
  removeNotice: (id: string) => Promise<void>;
  toggleChecklistItem: (noticeId: string, itemId: string) => Promise<void>;
  addChecklistItem: (noticeId: string, label: string) => Promise<void>;
  removeChecklistItem: (noticeId: string, itemId: string) => Promise<void>;
}

// Text-field edits (patchField in the notice detail page) fire on every
// keystroke; debounce the actual DB write per notice so typing stays snappy
// and we don't spam Supabase with one request per character.
const UPDATE_DEBOUNCE_MS = 600;
const updateTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useNoticeStore = create<NoticeStoreState>()((set, get) => ({
  notices: [],
  status: "idle",

  fetchNotices: async () => {
    set({ status: "loading" });
    try {
      const notices = await noticesApi.fetchNotices();
      set({ notices, status: "loaded" });
    } catch (error) {
      console.error("fetchNotices failed:", error);
      set({ status: "error" });
      showToast("공고 목록을 불러오지 못했습니다. 새로고침해주세요.");
    }
  },

  addNotice: async (draft) => {
    try {
      const created = await noticesApi.insertNotice({
        sourceFileName: draft.sourceFileName,
        rawLines: draft.rawLines,
        extracted: draft.extracted,
        checklistLabels: draft.checklist.map((item) => item.label),
      });
      set((state) => ({ notices: [created, ...state.notices] }));
      return created;
    } catch (error) {
      console.error("addNotice failed:", error);
      showToast("공고를 저장하지 못했습니다. 다시 시도해주세요.");
      return null;
    }
  },

  updateNotice: (id, patch) => {
    set((state) => ({
      notices: state.notices.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n,
      ),
    }));

    const existingTimer = updateTimers.get(id);
    if (existingTimer) clearTimeout(existingTimer);

    updateTimers.set(
      id,
      setTimeout(() => {
        updateTimers.delete(id);
        const notice = get().notices.find((n) => n.id === id);
        if (!notice) return;
        noticesApi
          .updateNoticeFields(id, {
            extracted: notice.extracted,
            userNotes: notice.userNotes,
          })
          .catch((error) => {
            console.error("updateNoticeFields failed:", error);
            showToast("변경사항 저장에 실패했습니다. 다시 시도해주세요.");
          });
      }, UPDATE_DEBOUNCE_MS),
    );
  },

  removeNotice: async (id) => {
    set((state) => ({ notices: state.notices.filter((n) => n.id !== id) }));
    try {
      await noticesApi.deleteNotice(id);
    } catch (error) {
      console.error("deleteNotice failed:", error);
      showToast("삭제에 실패했습니다. 새로고침 후 다시 시도해주세요.");
    }
  },

  toggleChecklistItem: async (noticeId, itemId) => {
    const notice = get().notices.find((n) => n.id === noticeId);
    const item = notice?.checklist.find((i) => i.id === itemId);
    if (!item) return;
    const nextChecked = !item.checked;

    set((state) => ({
      notices: state.notices.map((n) =>
        n.id !== noticeId
          ? n
          : {
              ...n,
              checklist: n.checklist.map((i) =>
                i.id === itemId ? { ...i, checked: nextChecked } : i,
              ),
            },
      ),
    }));

    try {
      await noticesApi.setChecklistItemChecked(itemId, nextChecked);
    } catch (error) {
      console.error("setChecklistItemChecked failed:", error);
      showToast("체크 상태 저장에 실패했습니다.");
    }
  },

  addChecklistItem: async (noticeId, label) => {
    const notice = get().notices.find((n) => n.id === noticeId);
    if (!notice) return;

    try {
      const item = await noticesApi.insertChecklistItem(
        noticeId,
        label,
        notice.checklist.length,
      );
      set((state) => ({
        notices: state.notices.map((n) =>
          n.id !== noticeId ? n : { ...n, checklist: [...n.checklist, item] },
        ),
      }));
    } catch (error) {
      console.error("addChecklistItem failed:", error);
      showToast("항목 추가에 실패했습니다.");
    }
  },

  removeChecklistItem: async (noticeId, itemId) => {
    set((state) => ({
      notices: state.notices.map((n) =>
        n.id !== noticeId
          ? n
          : { ...n, checklist: n.checklist.filter((i) => i.id !== itemId) },
      ),
    }));

    try {
      await noticesApi.deleteChecklistItem(itemId);
    } catch (error) {
      console.error("deleteChecklistItem failed:", error);
      showToast("삭제에 실패했습니다.");
    }
  },
}));

/** Loads notices from Supabase once per app session. Call from any page that reads notices. */
export function useEnsureNoticesLoaded() {
  const status = useNoticeStore((s) => s.status);
  const fetchNotices = useNoticeStore((s) => s.fetchNotices);

  useEffect(() => {
    if (status === "idle") fetchNotices();
  }, [status, fetchNotices]);
}
