import { ProjectRecordForm } from "@/components/performance/ProjectRecordForm";
import { EngineerRecordForm } from "@/components/performance/EngineerRecordForm";
import { ExportPanel } from "@/components/performance/ExportPanel";

export default function PerformancePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900">실적·경력 관리</h1>
      <ProjectRecordForm />
      <EngineerRecordForm />
      <ExportPanel />
    </div>
  );
}
