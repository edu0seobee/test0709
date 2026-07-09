import clsx from "clsx";

interface ProgressBarProps {
  percent: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ percent, label, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={clsx(
            "h-full rounded-full transition-all",
            clamped === 100 ? "bg-green-500" : "bg-blue-500",
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
