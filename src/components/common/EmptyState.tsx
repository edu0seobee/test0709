import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline-strong bg-canvas-soft px-6 py-16 text-center">
      <p className="text-base font-medium text-ink">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-mute">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
