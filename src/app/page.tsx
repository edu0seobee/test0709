"use client";

import { useNoticeStore } from "@/lib/store/useNoticeStore";
import { NoticeUploadDropzone } from "@/components/notices/NoticeUploadDropzone";
import { NoticeCard } from "@/components/notices/NoticeCard";
import { EmptyState } from "@/components/common/EmptyState";

export default function Home() {
  const notices = useNoticeStore((state) => state.notices);

  return (
    <div className="flex flex-col gap-6">
      <NoticeUploadDropzone />

      {notices.length === 0 ? (
        <EmptyState
          title="등록된 공고가 없습니다"
          description="입찰 공고 PDF를 업로드하면 핵심 정보가 카드로 정리됩니다."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      )}
    </div>
  );
}
