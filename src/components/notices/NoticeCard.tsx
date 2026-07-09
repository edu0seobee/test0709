"use client";

import { useState } from "react";
import Link from "next/link";
import { useNoticeStore } from "@/lib/store/useNoticeStore";
import type { NoticeCard as NoticeCardType } from "@/lib/types/notice";
import { calcProgress } from "@/lib/utils/progress";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { ProgressBar } from "@/components/common/ProgressBar";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DDayBadge } from "./DDayBadge";

interface NoticeCardProps {
  notice: NoticeCardType;
}

export function NoticeCard({ notice }: NoticeCardProps) {
  const removeNotice = useNoticeStore((state) => state.removeNotice);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const progress = calcProgress(notice.checklist);

  return (
    <Card className="flex flex-col gap-3 p-4 transition-shadow hover:shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a]">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/notices/${notice.id}`}
          className="text-base font-semibold tracking-[-0.6px] text-ink hover:underline"
        >
          {notice.extracted.title.value || "(제목 미확인)"}
        </Link>
        <DDayBadge deadlineIso={notice.extracted.deadline.value} />
      </div>

      <Badge tone="amber" className="self-start">
        ⚠ 원문 확인 필요
      </Badge>

      <dl className="grid grid-cols-[4.5rem_1fr] gap-y-1.5 border-t border-hairline pt-3 text-sm">
        <dt className="text-mute">발주기관</dt>
        <dd className="text-body">{notice.extracted.organization.value || "-"}</dd>
        <dt className="text-mute">예정금액</dt>
        <dd className="text-body">{formatCurrency(notice.extracted.estimatedAmount.value)}</dd>
        <dt className="text-mute">용역기간</dt>
        <dd className="truncate text-body">{notice.extracted.serviceDuration.value || "-"}</dd>
      </dl>

      <ProgressBar percent={progress} label="제출서류 준비" />

      <div className="mt-1 flex items-center justify-between border-t border-hairline pt-3">
        <Link
          href={`/notices/${notice.id}`}
          className="text-sm font-medium text-link hover:underline"
        >
          자세히 보기 →
        </Link>
        <Button variant="ghost" onClick={() => setConfirmingDelete(true)}>
          삭제
        </Button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="공고를 삭제할까요?"
        description="삭제하면 이 브라우저에서 다시 복구할 수 없습니다."
        onConfirm={() => {
          removeNotice(notice.id);
          setConfirmingDelete(false);
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </Card>
  );
}
