import { HTMLAttributes } from "react";
import clsx from "clsx";

type Tone = "gray" | "red" | "green" | "amber" | "blue";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  gray: "bg-canvas-soft-2 text-body",
  red: "bg-error-soft text-error-deep",
  green: "bg-cyan-soft text-cyan-deep",
  amber: "bg-warning-soft text-warning-deep",
  blue: "bg-link-bg-soft text-link-deep",
};

export function Badge({ tone = "gray", className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
