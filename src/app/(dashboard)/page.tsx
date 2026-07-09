"use client";

import { useEnsureNoticesLoaded, useNoticeStore } from "@/lib/store/useNoticeStore";
import { NoticeUploadDropzone } from "@/components/notices/NoticeUploadDropzone";
import { NaraSearchPanel } from "@/components/notices/NaraSearchPanel";
import { NoticeCard } from "@/components/notices/NoticeCard";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/common/Badge";

export default function Home() {
  useEnsureNoticesLoaded();
  const notices = useNoticeStore((state) => state.notices);
  const status = useNoticeStore((state) => state.status);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="공고 목록"
        description="입찰 공고 PDF를 업로드하면 핵심 정보가 카드로 정리됩니다."
        action={
          notices.length > 0 && <Badge tone="gray">총 {notices.length}건</Badge>
        }
      />

      <NoticeUploadDropzone />

      <NaraSearchPanel />

      {status === "loading" || status === "idle" ? (
        <p className="py-8 text-center text-sm text-mute">불러오는 중…</p>
      ) : notices.length === 0 ? (
        <EmptyState
          title="등록된 공고가 없습니다"
          description="위에서 PDF를 업로드하면 이곳에 카드로 정리됩니다."
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
