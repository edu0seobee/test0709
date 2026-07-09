import Link from "next/link";
import type { ReactNode } from "react";
import type { NoticeCard } from "@/lib/types/notice";
import { calcProgress } from "@/lib/utils/progress";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";
import { DDayBadge } from "@/components/notices/DDayBadge";
import { ProgressBar } from "@/components/common/ProgressBar";

interface CompareTableProps {
  notices: NoticeCard[];
}

interface Row {
  label: string;
  render: (notice: NoticeCard) => ReactNode;
}

const ROWS: Row[] = [
  { label: "발주기관", render: (n) => n.extracted.organization.value || "-" },
  {
    label: "예정금액",
    render: (n) => formatCurrency(n.extracted.estimatedAmount.value),
  },
  { label: "용역기간", render: (n) => n.extracted.serviceDuration.value || "-" },
  {
    label: "마감일",
    render: (n) => (
      <div className="flex flex-col gap-1">
        <DDayBadge deadlineIso={n.extracted.deadline.value} />
        <span className="text-xs text-gray-400">
          {formatDate(n.extracted.deadline.value)}
        </span>
      </div>
    ),
  },
  {
    label: "참가자격",
    render: (n) =>
      n.extracted.eligibility.value?.length ? (
        <ul className="list-inside list-disc space-y-0.5 text-left">
          {n.extracted.eligibility.value.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : (
        "-"
      ),
  },
  {
    label: "제출서류 준비",
    render: (n) => <ProgressBar percent={calcProgress(n.checklist)} />,
  },
];

export function CompareTable({ notices }: CompareTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="w-32 px-3 py-3 text-left font-medium text-gray-500">
              항목
            </th>
            {notices.map((notice) => (
              <th
                key={notice.id}
                className="min-w-56 px-3 py-3 text-left font-semibold text-gray-900"
              >
                <Link href={`/notices/${notice.id}`} className="hover:underline">
                  {notice.extracted.title.value || "(제목 미확인)"}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-b border-gray-100 align-top">
              <th className="px-3 py-3 text-left font-medium text-gray-500">
                {row.label}
              </th>
              {notices.map((notice) => (
                <td key={notice.id} className="px-3 py-3 text-gray-700">
                  {row.render(notice)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
