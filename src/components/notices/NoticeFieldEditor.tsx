import { ReactNode } from "react";
import { Badge } from "@/components/common/Badge";

interface NoticeFieldRowProps {
  label: string;
  matched: boolean;
  children: ReactNode;
}

/** Label + input wrapper shared by every editable field on the notice detail page. */
export function NoticeFieldRow({ label, matched, children }: NoticeFieldRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-body">{label}</span>
        {!matched && <Badge tone="amber">직접 확인/입력 필요</Badge>}
      </div>
      {children}
    </div>
  );
}

export const fieldInputClass =
  "w-full rounded-md border border-hairline px-3 py-2 text-sm text-ink focus:border-link focus:outline-none focus:ring-1 focus:ring-link";
