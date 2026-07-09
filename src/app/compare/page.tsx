"use client";

import Link from "next/link";
import { useNoticeStore } from "@/lib/store/useNoticeStore";
import { CompareTable } from "@/components/compare/CompareTable";
import { EmptyState } from "@/components/common/EmptyState";

export default function ComparePage() {
  const notices = useNoticeStore((s) => s.notices);

  if (notices.length === 0) {
    return (
      <EmptyState
        title="비교할 공고가 없습니다"
        description="공고를 먼저 업로드하면 여기에서 나란히 비교할 수 있습니다."
        action={
          <Link href="/" className="text-sm text-blue-600 hover:underline">
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
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            공고 업로드하러 가기
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-900">공고 비교</h1>
      <CompareTable notices={notices} />
    </div>
  );
}
