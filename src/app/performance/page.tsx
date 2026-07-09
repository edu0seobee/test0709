import { ProjectRecordForm } from "@/components/performance/ProjectRecordForm";
import { EngineerRecordForm } from "@/components/performance/EngineerRecordForm";
import { ExportPanel } from "@/components/performance/ExportPanel";
import { PageHeader } from "@/components/common/PageHeader";

export default function PerformancePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="실적·경력 관리"
        description="제출용 유사용역 실적과 기술자 경력을 등록해두고 문서로 내보냅니다."
      />
      <ProjectRecordForm />
      <EngineerRecordForm />
      <ExportPanel />
    </div>
  );
}
