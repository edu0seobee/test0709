import type { ExtractedField } from "@/lib/types/notice";
import { emptyExtractedField } from "@/lib/types/notice";
import { findLabelLine, LABELS } from "./patterns";

export function extractOrganization(lines: string[]): ExtractedField<string> {
  const match = findLabelLine(lines, LABELS.organization, { toIndex: 40 });
  if (!match) return emptyExtractedField<string>();

  const value = match.remainder || lines[match.lineIndex + 1]?.trim();
  if (!value) {
    return { value: null, raw: lines[match.lineIndex], matched: false };
  }
  return { value, raw: lines[match.lineIndex], matched: true };
}
