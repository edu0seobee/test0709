export interface DDayResult {
  diffDays: number;
  label: string;
  isUrgent: boolean;
  isPast: boolean;
}

const URGENT_THRESHOLD_DAYS = 7;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function calculateDDay(
  deadlineIso: string,
  now: Date = new Date(),
): DDayResult {
  const deadline = startOfDay(new Date(deadlineIso));
  const today = startOfDay(now);
  const diffDays = Math.round(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const isPast = diffDays < 0;
  const label = diffDays === 0 ? "D-Day" : diffDays > 0 ? `D-${diffDays}` : `D+${-diffDays}`;

  return {
    diffDays,
    label,
    isPast,
    isUrgent: !isPast && diffDays <= URGENT_THRESHOLD_DAYS,
  };
}
