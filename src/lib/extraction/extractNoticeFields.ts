import { createId } from "@/lib/utils/id";
import type { ChecklistItem, ExtractedFields, NoticeCard } from "@/lib/types/notice";
import { extractTitle } from "./extractTitle";
import { extractOrganization } from "./extractOrganization";
import { extractAmount } from "./extractAmount";
import { extractDuration } from "./extractDuration";
import { extractDeadline } from "./extractDeadline";
import { extractEligibility } from "./extractEligibility";
import { extractDocuments } from "./extractDocuments";

export function extractNoticeFields(
  lines: string[],
  fileName: string,
): ExtractedFields {
  return {
    title: extractTitle(lines, fileName),
    organization: extractOrganization(lines),
    estimatedAmount: extractAmount(lines),
    serviceDuration: extractDuration(lines),
    deadline: extractDeadline(lines),
    eligibility: extractEligibility(lines),
    submissionDocuments: extractDocuments(lines),
  };
}

export function buildNoticeCard(
  lines: string[],
  fileName: string,
): NoticeCard {
  const extracted = extractNoticeFields(lines, fileName);
  const now = Date.now();

  const checklist: ChecklistItem[] = (extracted.submissionDocuments.value ?? []).map(
    (label) => ({
      id: createId(),
      label,
      checked: false,
    }),
  );

  return {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    sourceFileName: fileName,
    rawLines: lines,
    extracted,
    checklist,
  };
}
