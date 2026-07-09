import type { ExtractedField } from "@/lib/types/notice";
import { emptyExtractedField } from "@/lib/types/notice";
import { LABELS } from "./patterns";

const DATE_PATTERNS: RegExp[] = [
  // 2026.07.09 18:00 / 2026-07-09 18:00
  /(\d{4})[.\-]\s*(\d{1,2})[.\-]\s*(\d{1,2})\D{0,6}?(\d{1,2})[:시]\s*(\d{1,2})?/,
  // 2026년 7월 9일 18시 00분
  /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일(?:\D{0,4}?(\d{1,2})시\s*(\d{1,2})?분?)?/,
  // 2026.07.09 (date only, no time)
  /(\d{4})[.\-]\s*(\d{1,2})[.\-]\s*(\d{1,2})/,
];

interface ParsedDate {
  iso: string;
  raw: string;
}

function parseDateFromText(text: string): ParsedDate | null {
  for (const pattern of DATE_PATTERNS) {
    const m = text.match(pattern);
    if (!m) continue;

    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    const hour = m[4] ? Number(m[4]) : 0;
    const minute = m[5] ? Number(m[5]) : 0;

    if (month < 1 || month > 12 || day < 1 || day > 31) continue;
    if (hour > 23 || minute > 59) continue;

    const date = new Date(year, month - 1, day, hour, minute);
    if (Number.isNaN(date.getTime())) continue;

    return { iso: date.toISOString(), raw: m[0].trim() };
  }
  return null;
}

export function extractDeadline(lines: string[]): ExtractedField<string> {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (LABELS.deadlineExclude.some((label) => line.includes(label))) continue;
    if (!LABELS.deadline.some((label) => line.includes(label))) continue;

    const windowText = [line, lines[i + 1] ?? "", lines[i + 2] ?? ""].join(
      " ",
    );
    const parsed = parseDateFromText(windowText);
    if (parsed) {
      return { value: parsed.iso, raw: parsed.raw, matched: true };
    }
  }
  return emptyExtractedField<string>();
}
