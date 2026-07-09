import { NextResponse } from "next/server";
import {
  fetchNaraAttachments,
  fetchNaraLicenseLimits,
  fetchNaraNoticeDetail,
  fetchNaraParticipationRegions,
} from "@/lib/naraMarket/client";
import type { NaraBizType } from "@/lib/naraMarket/types";

export const runtime = "nodejs";

function isBizType(value: string | null): value is NaraBizType {
  return value === "servc" || value === "cnstwk";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bizType = searchParams.get("bizType");
  const bidNtceNo = searchParams.get("bidNtceNo");
  const bidNtceOrd = searchParams.get("bidNtceOrd") ?? "000";

  if (!isBizType(bizType) || !bidNtceNo) {
    return NextResponse.json({ error: "bizType과 bidNtceNo가 필요합니다." }, { status: 400 });
  }

  try {
    const detail = await fetchNaraNoticeDetail(bizType, bidNtceNo);
    if (!detail) {
      return NextResponse.json({ error: "해당 공고를 찾을 수 없습니다." }, { status: 404 });
    }

    const [licenseLimits, participationRegions, attachments] = await Promise.all([
      fetchNaraLicenseLimits(bidNtceNo, bidNtceOrd).catch((err) => {
        console.error("면허제한정보 조회 실패:", err);
        return [];
      }),
      fetchNaraParticipationRegions(bidNtceNo, bidNtceOrd).catch((err) => {
        console.error("참가가능지역정보 조회 실패:", err);
        return [];
      }),
      fetchNaraAttachments(bidNtceNo).catch((err) => {
        console.error("e발주 첨부파일정보 조회 실패:", err);
        return [];
      }),
    ]);

    return NextResponse.json({ detail, licenseLimits, participationRegions, attachments });
  } catch (err) {
    console.error("나라장터 상세 조회 실패:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "상세 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
