"use client";

import { useState } from "react";
import { useProfileStore } from "@/lib/store/useProfileStore";
import { buildPerformanceDocx } from "@/lib/export/buildPerformanceDocx";
import { downloadBlob } from "@/lib/export/downloadBlob";
import { showToast } from "@/lib/utils/toast";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";

export function ExportPanel() {
  const projectRecords = useProfileStore((s) => s.projectRecords);
  const engineers = useProfileStore((s) => s.engineers);
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      const blob = await buildPerformanceDocx(projectRecords, engineers);
      downloadBlob(blob, "유사용역_실적_기술자경력.docx");
    } catch {
      showToast("문서를 만드는 중 문제가 발생했습니다.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <h2 className="text-base font-semibold text-gray-900">문서로 내보내기</h2>
      <p className="text-sm text-gray-500">
        저장된 유사용역 실적과 기술자 경력을 워드(.docx) 파일로 내보냅니다. 다운로드한
        파일은 한글(HWP) 프로그램에서 그대로 열어 확인·수정한 뒤 &ldquo;다른 이름으로
        저장&rdquo;으로 .hwp 파일로 저장할 수 있습니다.
      </p>
      <div>
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? "만드는 중…" : "문서로 내보내기 (.docx)"}
        </Button>
      </div>
    </Card>
  );
}
