"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { extractPdfText } from "@/lib/pdf/extractText";
import { buildNoticeCard } from "@/lib/extraction/extractNoticeFields";
import { useNoticeStore } from "@/lib/store/useNoticeStore";
import { showToast } from "@/lib/utils/toast";
import { Button } from "@/components/common/Button";

export function NoticeUploadDropzone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addNotice = useNoticeStore((state) => state.addNotice);
  const router = useRouter();

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((f) =>
      f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    if (files.length === 0) {
      showToast("PDF 파일만 업로드할 수 있습니다.");
      return;
    }

    setIsProcessing(true);
    let lastCreatedId: string | null = null;

    for (const file of files) {
      try {
        const { lines, likelyScanned } = await extractPdfText(file);
        const card = buildNoticeCard(lines, file.name);
        const created = await addNotice(card);
        lastCreatedId = created?.id ?? null;
        if (likelyScanned) {
          showToast(
            `${file.name}: 텍스트를 거의 찾지 못했습니다. 스캔 이미지 PDF일 수 있어 모든 항목을 직접 입력해야 합니다.`,
          );
        }
      } catch {
        showToast(`${file.name} 파일을 읽는 중 문제가 발생했습니다.`);
      }
    }

    setIsProcessing(false);
    if (files.length === 1 && lastCreatedId) {
      router.push(`/notices/${lastCreatedId}`);
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={clsx(
        "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
        isDragging ? "border-link bg-link-bg-soft" : "border-hairline-strong bg-canvas",
      )}
    >
      <p className="text-base font-medium text-ink">
        공고 PDF를 여기로 끌어다 놓거나 파일을 선택하세요
      </p>
      <p className="text-sm text-mute">
        텍스트가 포함된 PDF만 지원합니다. 스캔한 이미지 PDF는 정보를 자동으로 뽑을 수 없어요.
      </p>
      <Button
        type="button"
        disabled={isProcessing}
        onClick={() => inputRef.current?.click()}
      >
        {isProcessing ? "분석 중…" : "PDF 파일 선택"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
