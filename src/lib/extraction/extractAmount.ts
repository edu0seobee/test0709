import type { ExtractedField } from "@/lib/types/notice";
import { emptyExtractedField } from "@/lib/types/notice";
import { findLabelLine, LABELS } from "./patterns";

export function extractAmount(lines: string[]): ExtractedField<number> {
  const match = findLabelLine(lines, LABELS.amount);
  if (!match) return emptyExtractedField<number>();

  const windowText = [match.remainder, lines[match.lineIndex + 1] ?? ""].join(
    " ",
  );
  const amountMatch = windowText.match(/([0-9][0-9,]*)\s*원/);
  if (!amountMatch) {
    return { value: null, raw: lines[match.lineIndex], matched: false };
  }

  const numeric = Number(amountMatch[1].replace(/,/g, ""));
  if (Number.isNaN(numeric)) {
    return { value: null, raw: lines[match.lineIndex], matched: false };
  }
  return { value: numeric, raw: amountMatch[0], matched: true };
}
