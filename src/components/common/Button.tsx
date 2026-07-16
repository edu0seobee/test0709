import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-ink text-on-primary hover:bg-[#2e2e2e] disabled:bg-hairline-strong",
  secondary:
    "bg-canvas text-ink border border-hairline hover:bg-canvas-soft disabled:text-mute",
  danger: "bg-error text-white hover:bg-error-deep disabled:bg-error-soft disabled:text-error-deep",
  ghost: "bg-transparent text-body hover:bg-canvas-soft disabled:text-mute",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium tracking-[-0.28px] transition-colors disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
