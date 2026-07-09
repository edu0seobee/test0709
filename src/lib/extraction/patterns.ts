export const LABELS = {
  title: ["입찰공고명", "공고명", "사업명"],
  organization: ["발주기관", "수요기관", "발주처", "공고기관"],
  amount: ["추정가격", "예정가격", "기초금액", "사업금액", "추정금액"],
  duration: ["용역기간", "계약기간", "이행기간", "사업기간"],
  deadline: ["입찰마감일시", "제출마감일시", "제출마감", "마감일시", "입찰마감"],
  deadlineExclude: ["개찰일시", "개찰일자", "낙찰"],
  eligibility: ["참가자격", "입찰참가자격"],
  documents: ["제출서류", "구비서류"],
} as const;

export interface LabelMatch {
  lineIndex: number;
  label: string;
  remainder: string;
}

interface FindLabelOptions {
  fromIndex?: number;
  toIndex?: number;
}

/** Finds the first line containing one of `labels` and returns any text after it. */
export function findLabelLine(
  lines: string[],
  labels: readonly string[],
  { fromIndex = 0, toIndex = lines.length }: FindLabelOptions = {},
): LabelMatch | null {
  const end = Math.min(toIndex, lines.length);
  for (let i = fromIndex; i < end; i++) {
    const line = lines[i];
    for (const label of labels) {
      const idx = line.indexOf(label);
      if (idx !== -1) {
        const remainder = line
          .slice(idx + label.length)
          .replace(/^[\s:：\-]+/, "")
          .trim();
        return { lineIndex: i, label, remainder };
      }
    }
  }
  return null;
}

/**
 * Collects lines after a label until a line matching any of `stopLabels`
 * is found (assumed to start the next section), or `maxLines` is reached.
 */
export function captureBlock(
  lines: string[],
  startIndex: number,
  remainder: string,
  stopLabels: readonly string[],
  maxLines = 25,
): string[] {
  const collected: string[] = [];
  if (remainder) collected.push(remainder);

  for (
    let i = startIndex + 1;
    i < lines.length && collected.length < maxLines;
    i++
  ) {
    const line = lines[i];
    if (stopLabels.some((label) => line.includes(label))) break;
    if (line.trim().length === 0) continue;
    collected.push(line.trim());
  }
  return collected;
}

const BULLET_PREFIX =
  /^[\s]*(?:[○◯•·ㆍ\-‐–—*]|[0-9]+[.)]|[가나다라마바사아자차카타파하][.)])\s*/;

export function stripBulletPrefix(line: string): string {
  return line.replace(BULLET_PREFIX, "").trim();
}

export function blockToList(block: string[]): string[] {
  return block
    .map(stripBulletPrefix)
    .filter((line) => line.length > 0);
}
