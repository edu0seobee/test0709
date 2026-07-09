import type { ExtractedField } from "@/lib/types/notice";
import { emptyExtractedField } from "@/lib/types/notice";
import { blockToList, captureBlock, findLabelLine, LABELS } from "./patterns";

const STOP_LABELS = [...LABELS.documents, ...LABELS.duration, ...LABELS.amount];

export function extractEligibility(lines: string[]): ExtractedField<string[]> {
  const match = findLabelLine(lines, LABELS.eligibility);
  if (!match) return emptyExtractedField<string[]>();

  const block = captureBlock(lines, match.lineIndex, match.remainder, STOP_LABELS);
  const list = blockToList(block);
  if (list.length === 0) {
    return { value: null, raw: lines[match.lineIndex], matched: false };
  }
  return { value: list, raw: block.join("\n"), matched: true };
}
