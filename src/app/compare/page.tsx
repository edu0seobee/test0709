"use client";

import Link from "next/link";
import { useEnsureNoticesLoaded, useNoticeStore } from "@/lib/store/useNoticeStore";
import { CompareTable } from "@/components/compare/CompareTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";

export default function ComparePage() {
  useEnsureNoticesLoaded();
  const notices = useNoticeStore((s) => s.notices);
  const status = useNoticeStore((s) => s.status);

  if (status === "loading" || status === "idle") {
    return <p className="py-8 text-center text-sm text-mute">불러오는 중…</p>;
  }

  if (notices.length === 0) {
    return (
      <EmptyState
        title="비교할 공고가 없습니다"
        description="공고를 먼저 업로드하면 여기에서 나란히 비교할 수 있습니다."
        action={
          <Link href="/" className="text-sm text-link hover:underline">
            공고 업로드하러 가기
          </Link>
        }
      />
    );
  }

  if (notices.length === 1) {
    return (
      <EmptyState
        title="비교하려면 공고가 2개 이상 필요합니다"
        description="현재 등록된 공고가 1개뿐입니다. 공고를 하나 더 업로드해주세요."
        action={
          <Link href="/" className="text-sm text-link hover:underline">
            공고 업로드하러 가기
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="공고 비교"
        description="선택한 공고들의 예정금액·마감일·참가자격·준비 현황을 나란히 비교합니다."
      />
      <CompareTable notices={notices} />
    </div>
  );
}
