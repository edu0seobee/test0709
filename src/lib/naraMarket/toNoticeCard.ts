import { createId } from "@/lib/utils/id";
import { emptyExtractedField } from "@/lib/types/notice";
import type { ChecklistItem, NoticeCard } from "@/lib/types/notice";
import type { NaraNoticeDetail } from "./types";
import { naraDateToIso } from "./dateUtils";

const BIZ_TYPE_LABEL: Record<NaraNoticeDetail["bizType"], string> = {
  servc: "용역",
  cnstwk: "공사",
};

function buildEligibilityNotes(detail: NaraNoticeDetail): string[] {
  const notes: string[] = [];
  if (detail.cntrctCnclsMthdNm) notes.push(`계약체결방법: ${detail.cntrctCnclsMthdNm}`);
  if (detail.bidMethdNm) notes.push(`입찰방식: ${detail.bidMethdNm}`);
  if (detail.indstrytyLmtYn) {
    notes.push(
      `업종(면허) 제한여부: ${detail.indstrytyLmtYn === "Y" ? "있음 (하단 '나라장터 실시간 정보'에서 면허제한 상세 확인)" : "없음"}`,
    );
  }
  if (detail.cmmnSpldmdMethdNm) notes.push(`공동수급방식: ${detail.cmmnSpldmdMethdNm}`);
  if (detail.rgnDutyJntcontrctYn) {
    notes.push(`지역의무공동도급: ${detail.rgnDutyJntcontrctYn === "Y" ? "있음" : "없음"}`);
  }
  if (detail.bidPrtcptLmtYn) notes.push(`입찰참가제한여부: ${detail.bidPrtcptLmtYn}`);
  return notes;
}

function buildRawLines(detail: NaraNoticeDetail): string[] {
  const lines: string[] = [
    "[나라장터 공공데이터 API로 가져온 공고입니다 — PDF 원문이 아닌 API 응답 데이터이며, 반드시 실제 공고 원문과 대조 확인하세요]",
    `업무구분: ${BIZ_TYPE_LABEL[detail.bizType]}`,
    `입찰공고번호: ${detail.bidNtceNo} (차수 ${detail.bidNtceOrd})`,
    `공고명: ${detail.bidNtceNm}`,
    `공고기관: ${detail.ntceInsttNm || "-"}`,
    `수요기관: ${detail.dminsttNm || "-"}`,
    `계약체결방법: ${detail.cntrctCnclsMthdNm ?? "-"}`,
    `입찰방식: ${detail.bidMethdNm ?? "-"}`,
    `입찰공고일시: ${detail.bidNtceDt ?? "-"}`,
    `입찰마감일시: ${detail.bidClseDt ?? "-"}`,
    `개찰일시: ${detail.opengDt ?? "-"}`,
    `추정가격: ${detail.presmptPrce != null ? `${detail.presmptPrce.toLocaleString()}원` : "-"}`,
  ];
  if (detail.bdgtAmt != null) lines.push(`예산금액: ${detail.bdgtAmt.toLocaleString()}원`);
  if (detail.asignBdgtAmt != null) lines.push(`배정예산금액: ${detail.asignBdgtAmt.toLocaleString()}원`);
  if (detail.indstrytyLmtYn) lines.push(`업종(면허) 제한여부: ${detail.indstrytyLmtYn}`);
  if (detail.cmmnSpldmdMethdNm) lines.push(`공동수급방식: ${detail.cmmnSpldmdMethdNm}`);
  if (detail.rgnDutyJntcontrctYn) lines.push(`지역의무공동도급여부: ${detail.rgnDutyJntcontrctYn}`);
  if (detail.bidPrtcptLmtYn) lines.push(`입찰참가제한여부: ${detail.bidPrtcptLmtYn}`);
  for (const doc of detail.specDocs) {
    lines.push(`공고규격서: ${doc.name}${doc.url ? ` (${doc.url})` : ""}`);
  }
  if (detail.stdNtceDocUrl) lines.push(`표준공고서: ${detail.stdNtceDocUrl}`);
  if (detail.bidNtceUrl) lines.push(`공고 원문 링크: ${detail.bidNtceUrl}`);
  return lines;
}

export function buildNoticeCardFromNara(detail: NaraNoticeDetail): NoticeCard {
  const now = Date.now();

  const eligibilityNotes = buildEligibilityNotes(detail);

  const submissionDocuments = detail.specDocs.filter((d) => d.name).map((d) => d.name);
  if (detail.stdNtceDocUrl) submissionDocuments.push("표준공고서");

  const estimatedAmount = detail.presmptPrce ?? detail.bdgtAmt ?? detail.asignBdgtAmt ?? null;

  const checklist: ChecklistItem[] = submissionDocuments.map((label) => ({
    id: createId(),
    label,
    checked: false,
  }));

  return {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    sourceFileName: `나라장터 API (${detail.bidNtceNo})`,
    rawLines: buildRawLines(detail),
    extracted: {
      title: { value: detail.bidNtceNm, raw: detail.bidNtceNm, matched: true },
      organization: {
        value: detail.ntceInsttNm || detail.dminsttNm || null,
        raw: detail.ntceInsttNm,
        matched: Boolean(detail.ntceInsttNm || detail.dminsttNm),
      },
      estimatedAmount: {
        value: estimatedAmount,
        raw: estimatedAmount != null ? String(estimatedAmount) : null,
        matched: estimatedAmount != null,
      },
      serviceDuration: emptyExtractedField<string>(),
      deadline: {
        value: naraDateToIso(detail.bidClseDt),
        raw: detail.bidClseDt,
        matched: Boolean(detail.bidClseDt),
      },
      eligibility: {
        value: eligibilityNotes.length > 0 ? eligibilityNotes : null,
        raw: null,
        matched: eligibilityNotes.length > 0,
      },
      submissionDocuments: {
        value: submissionDocuments.length > 0 ? submissionDocuments : null,
        raw: null,
        matched: submissionDocuments.length > 0,
      },
    },
    checklist,
    naraSource: {
      bizType: detail.bizType,
      bidNtceNo: detail.bidNtceNo,
      bidNtceOrd: detail.bidNtceOrd,
    },
  };
}
