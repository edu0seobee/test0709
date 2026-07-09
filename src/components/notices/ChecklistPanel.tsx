"use client";

import { useState } from "react";
import { useNoticeStore } from "@/lib/store/useNoticeStore";
import type { NoticeCard } from "@/lib/types/notice";
import { calcProgress } from "@/lib/utils/progress";
import { ProgressBar } from "@/components/common/ProgressBar";
import { Button } from "@/components/common/Button";

interface ChecklistPanelProps {
  notice: NoticeCard;
}

export function ChecklistPanel({ notice }: ChecklistPanelProps) {
  const toggleChecklistItem = useNoticeStore((s) => s.toggleChecklistItem);
  const addChecklistItem = useNoticeStore((s) => s.addChecklistItem);
  const removeChecklistItem = useNoticeStore((s) => s.removeChecklistItem);
  const [newLabel, setNewLabel] = useState("");

  const progress = calcProgress(notice.checklist);

  function handleAdd() {
    const label = newLabel.trim();
    if (!label) return;
    addChecklistItem(notice.id, label);
    setNewLabel("");
  }

  return (
    <div className="flex flex-col gap-3">
      <ProgressBar percent={progress} label="제출서류 준비 진행률" />

      {notice.checklist.length === 0 ? (
        <p className="text-sm text-mute">
          추출된 제출서류가 없습니다. 아래에서 직접 추가해주세요.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {notice.checklist.map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleChecklistItem(notice.id, item.id)}
                className="h-4 w-4 rounded border-hairline-strong accent-ink"
              />
              <span
                className={
                  item.checked ? "flex-1 text-sm text-mute line-through" : "flex-1 text-sm text-ink"
                }
              >
                {item.label}
              </span>
              <button
                type="button"
                onClick={() => removeChecklistItem(notice.id, item.id)}
                className="text-xs text-mute hover:text-error"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="제출서류 항목 추가"
          className="flex-1 rounded-md border border-hairline px-3 py-1.5 text-sm focus:border-link focus:outline-none focus:ring-1 focus:ring-link"
        />
        <Button variant="secondary" onClick={handleAdd}>
          추가
        </Button>
      </div>
    </div>
  );
}
