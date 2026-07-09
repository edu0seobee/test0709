import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { guardedLocalStorage } from "@/lib/utils/storage-guard";
import { createId } from "@/lib/utils/id";
import type { ChecklistItem, NoticeCard } from "@/lib/types/notice";

interface NoticeStoreState {
  notices: NoticeCard[];
  addNotice: (notice: NoticeCard) => void;
  updateNotice: (id: string, patch: Partial<NoticeCard>) => void;
  removeNotice: (id: string) => void;
  toggleChecklistItem: (noticeId: string, itemId: string) => void;
  addChecklistItem: (noticeId: string, label: string) => void;
  removeChecklistItem: (noticeId: string, itemId: string) => void;
}

export const useNoticeStore = create<NoticeStoreState>()(
  persist(
    (set) => ({
      notices: [],

      addNotice: (notice) =>
        set((state) => ({ notices: [notice, ...state.notices] })),

      updateNotice: (id, patch) =>
        set((state) => ({
          notices: state.notices.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n,
          ),
        })),

      removeNotice: (id) =>
        set((state) => ({
          notices: state.notices.filter((n) => n.id !== id),
        })),

      toggleChecklistItem: (noticeId, itemId) =>
        set((state) => ({
          notices: state.notices.map((n) =>
            n.id !== noticeId
              ? n
              : {
                  ...n,
                  updatedAt: Date.now(),
                  checklist: n.checklist.map((item: ChecklistItem) =>
                    item.id === itemId
                      ? { ...item, checked: !item.checked }
                      : item,
                  ),
                },
          ),
        })),

      addChecklistItem: (noticeId, label) =>
        set((state) => ({
          notices: state.notices.map((n) =>
            n.id !== noticeId
              ? n
              : {
                  ...n,
                  updatedAt: Date.now(),
                  checklist: [
                    ...n.checklist,
                    {
                      id: createId(),
                      label,
                      checked: false,
                      addedManually: true,
                    },
                  ],
                },
          ),
        })),

      removeChecklistItem: (noticeId, itemId) =>
        set((state) => ({
          notices: state.notices.map((n) =>
            n.id !== noticeId
              ? n
              : {
                  ...n,
                  updatedAt: Date.now(),
                  checklist: n.checklist.filter((item) => item.id !== itemId),
                },
          ),
        })),
    }),
    {
      name: "bid-analyzer/notices",
      version: 1,
      storage: createJSONStorage(() => guardedLocalStorage),
      // Bump `version` and add a migrate() step whenever NoticeCard's
      // shape changes, so existing users' saved notices aren't wiped.
      migrate: (persistedState) => persistedState as NoticeStoreState,
    },
  ),
);
