/** Converts a 나라장터 API date string ("YYYY-MM-DD HH:MM:SS") into an ISO string, or null if unparsable. */
export function naraDateToIso(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim().replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
