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
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/notices/${notice.id}`}
          className="text-base font-semibold text-gray-900 hover:underline"
        >
          {notice.extracted.title.value || "(제목 미확인)"}
        </Link>
        <DDayBadge deadlineIso={notice.extracted.deadline.value} />
      </div>

      <Badge tone="amber">⚠ 원문 확인 필요</Badge>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-gray-600">
        <dt className="text-gray-400">발주기관</dt>
        <dd>{notice.extracted.organization.value || "-"}</dd>
        <dt className="text-gray-400">예정금액</dt>
        <dd>{formatCurrency(notice.extracted.estimatedAmount.value)}</dd>
        <dt className="text-gray-400">용역기간</dt>
        <dd className="truncate">{notice.extracted.serviceDuration.value || "-"}</dd>
      </dl>

      <ProgressBar percent={progress} label="제출서류 준비" />

      <div className="mt-1 flex items-center justify-between">
        <Link
          href={`/notices/${notice.id}`}
          className="text-sm font-medium text-blue-600 hover:underline"
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
