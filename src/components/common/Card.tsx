import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-md border border-hairline bg-canvas shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a]",
        className,
      )}
      {...props}
    />
  );
}
