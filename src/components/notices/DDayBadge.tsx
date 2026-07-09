"use client";

import clsx from "clsx";
import { calculateDDay } from "@/lib/dday/calculateDDay";
import { useIsClient } from "@/lib/utils/useIsClient";
import { Badge } from "@/components/common/Badge";

interface DDayBadgeProps {
  deadlineIso: string | null;
}

export function DDayBadge({ deadlineIso }: DDayBadgeProps) {
  // D-Day depends on "today" (client clock), so it's computed after mount
  // to avoid SSR/CSR hydration mismatches.
  const mounted = useIsClient();

  if (!deadlineIso) {
    return <Badge tone="gray">마감일 미확인</Badge>;
  }

  if (!mounted) {
    return <Badge tone="gray">계산 중…</Badge>;
  }

  const { label, isUrgent, isPast } = calculateDDay(deadlineIso);

  return (
    <Badge
      tone={isPast ? "gray" : isUrgent ? "red" : "blue"}
      className={clsx(isUrgent && !isPast && "animate-pulse")}
    >
      {isPast ? `마감 (${label})` : label}
    </Badge>
  );
}
