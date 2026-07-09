export function formatCurrency(amount: number | null): string {
  if (amount === null || Number.isNaN(amount)) return "-";
  return `${amount.toLocaleString("ko-KR")}원`;
}
