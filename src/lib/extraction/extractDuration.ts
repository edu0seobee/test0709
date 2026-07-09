import type { ExtractedField } from "@/lib/types/notice";
import { emptyExtractedField } from "@/lib/types/notice";
import { findLabelLine, LABELS } from "./patterns";

// 상대기간 표현("계약체결일로부터 O개월")이 흔해 날짜로 정규화하지 않고
// 라벨 뒤 원문 텍스트를 그대로 보존한다.
export function extractDuration(lines: string[]): ExtractedField<string> {
  const match = findLabelLine(lines, LABELS.duration);
  if (!match) return emptyExtractedField<string>();

  const value = match.remainder || lines[match.lineIndex + 1]?.trim();
  if (!value) {
    return { value: null, raw: lines[match.lineIndex], matched: false };
  }
  return { value, raw: lines[match.lineIndex], matched: true };
}
