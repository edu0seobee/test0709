import type { ExtractedField } from "@/lib/types/notice";
import { emptyExtractedField } from "@/lib/types/notice";
import { findLabelLine, LABELS } from "./patterns";

export function extractTitle(
  lines: string[],
  fallbackFileName: string,
): ExtractedField<string> {
  const match = findLabelLine(lines, LABELS.title, { toIndex: 20 });
  if (match?.remainder) {
    return { value: match.remainder, raw: lines[match.lineIndex], matched: true };
  }

  const base = fallbackFileName.replace(/\.pdf$/i, "").trim();
  if (base.length === 0) return emptyExtractedField<string>();
  return { value: base, raw: fallbackFileName, matched: false };
}
