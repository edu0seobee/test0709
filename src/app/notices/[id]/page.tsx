"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEnsureNoticesLoaded, useNoticeStore } from "@/lib/store/useNoticeStore";
import { formatDate } from "@/lib/utils/formatDate";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DDayBadge } from "@/components/notices/DDayBadge";
import { NoticeFieldRow, fieldInputClass } from "@/components/notices/NoticeFieldEditor";
import { RawTextViewer } from "@/components/notices/RawTextViewer";
import { ChecklistPanel } from "@/components/notices/ChecklistPanel";
import { AiSummaryCard } from "@/components/notices/AiSummaryCard";

function toDateTimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NoticeDetailPage() {
  useEnsureNoticesLoaded();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const notice = useNoticeStore((s) => s.notices.find((n) => n.id === params.id));
  const status = useNoticeStore((s) => s.status);
  const updateNotice = useNoticeStore((s) => s.updateNotice);
  const removeNotice = useNoticeStore((s) => s.removeNotice);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!notice && (status === "loading" || status === "idle")) {
    return <p className="py-8 text-center text-sm text-gray-400">불러오는 중…</p>;
  }

  if (!notice) {
    return (
      <EmptyState
        title="공고를 찾을 수 없습니다"
        description="삭제되었거나 잘못된 주소일 수 있습니다."
        action={<Link href="/" className="text-sm text-blue-600 hover:underline">목록으로 돌아가기</Link>}
      />
    );
  }

  const e = notice.extracted;
  const noticeId = notice.id;

  function patchField<K extends keyof typeof e>(
    key: K,
    value: (typeof e)[K]["value"],
  ) {
    updateNotice(noticeId, {
      extracted: {
        ...e,
        [key]: { ...e[key], value, matched: true },
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← 목록으로
          </Link>
          <h1 className="mt-1 text-xl font-bold text-gray-900">
            {e.title.value || "(제목 미확인)"}
          </h1>
        </div>
        <DDayBadge deadlineIso={e.deadline.value} />
      </div>

      <Card className="p-4">
        <Badge tone="amber">⚠ 원문 확인 필요 — 자동 추출 결과는 참고용입니다. 반드시 원문과 대조해 확인하세요.</Badge>
      </Card>

      <AiSummaryCard text={notice.rawLines.join("\n")} />

      <Card className="flex flex-col gap-5 p-5">
        <NoticeFieldRow label="공고명" matched={e.title.matched}>
          <input
            className={fieldInputClass}
            value={e.title.value ?? ""}
            onChange={(ev) => patchField("title", ev.target.value)}
          />
        </NoticeFieldRow>

        <NoticeFieldRow label="발주기관" matched={e.organization.matched}>
          <input
            className={fieldInputClass}
            value={e.organization.value ?? ""}
            onChange={(ev) => patchField("organization", ev.target.value)}
          />
        </NoticeFieldRow>

        <NoticeFieldRow label="예정금액 (원)" matched={e.estimatedAmount.matched}>
          <input
            type="number"
            className={fieldInputClass}
            value={e.estimatedAmount.value ?? ""}
            onChange={(ev) =>
              patchField(
                "estimatedAmount",
                ev.target.value === "" ? null : Number(ev.target.value),
              )
            }
          />
        </NoticeFieldRow>

        <NoticeFieldRow label="용역기간" matched={e.serviceDuration.matched}>
          <input
            className={fieldInputClass}
            value={e.serviceDuration.value ?? ""}
            onChange={(ev) => patchField("serviceDuration", ev.target.value)}
          />
        </NoticeFieldRow>

        <NoticeFieldRow label="마감일시" matched={e.deadline.matched}>
          <input
            type="datetime-local"
            className={fieldInputClass}
            value={toDateTimeLocal(e.deadline.value)}
            onChange={(ev) =>
              patchField(
                "deadline",
                ev.target.value ? new Date(ev.target.value).toISOString() : null,
              )
            }
          />
          {e.deadline.value && (
            <p className="text-xs text-gray-400">{formatDate(e.deadline.value)}</p>
          )}
        </NoticeFieldRow>

        <NoticeFieldRow label="참가자격" matched={e.eligibility.matched}>
          <textarea
            className={`${fieldInputClass} min-h-24`}
            value={(e.eligibility.value ?? []).join("\n")}
            onChange={(ev) =>
              patchField(
                "eligibility",
                ev.target.value.split("\n").map((l) => l.trim()).filter(Boolean),
              )
            }
            placeholder="한 줄에 하나씩 입력하세요"
          />
        </NoticeFieldRow>

        <NoticeFieldRow label="제출서류 (추출 원본)" matched={e.submissionDocuments.matched}>
          <textarea
            className={`${fieldInputClass} min-h-24`}
            value={(e.submissionDocuments.value ?? []).join("\n")}
            onChange={(ev) =>
              patchField(
                "submissionDocuments",
                ev.target.value.split("\n").map((l) => l.trim()).filter(Boolean),
              )
            }
            placeholder="한 줄에 하나씩 입력하세요"
          />
          <p className="text-xs text-gray-400">
            실제 준비 체크리스트는 아래 &ldquo;제출서류 체크리스트&rdquo;에서 관리하세요.
          </p>
        </NoticeFieldRow>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-base font-semibold text-gray-900">제출서류 체크리스트</h2>
        <ChecklistPanel notice={notice} />
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-base font-semibold text-gray-900">원문 확인</h2>
        <RawTextViewer rawLines={notice.rawLines} />
      </Card>

      <div>
        <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
          이 공고 삭제
        </Button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="공고를 삭제할까요?"
        description="삭제하면 이 브라우저에서 다시 복구할 수 없습니다."
        onConfirm={() => {
          removeNotice(notice.id);
          router.push("/");
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
