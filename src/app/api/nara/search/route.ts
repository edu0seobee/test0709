import { NextResponse } from "next/server";
import { searchNaraNotices } from "@/lib/naraMarket/client";
import type { NaraBizType } from "@/lib/naraMarket/types";

export const runtime = "nodejs";

function toYmdHm(dateStr: string, endOfDay: boolean): string {
  const compact = dateStr.replace(/-/g, "");
  return `${compact}${endOfDay ? "2359" : "0000"}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bizTypeParam = searchParams.get("bizType") ?? "all";
  const keyword = searchParams.get("keyword") ?? undefined;
  const institution = searchParams.get("institution") ?? undefined;
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  if (!dateFrom || !dateTo) {
    return NextResponse.json(
      { error: "검색 기간(dateFrom, dateTo)을 입력해주세요." },
      { status: 400 },
    );
  }

  const bizTypes: NaraBizType[] =
    bizTypeParam === "servc"
      ? ["servc"]
      : bizTypeParam === "cnstwk"
        ? ["cnstwk"]
        : ["servc", "cnstwk"];

  try {
    const items = await searchNaraNotices({
      bizTypes,
      keyword,
      institution,
      dateFromYmdHm: toYmdHm(dateFrom, false),
      dateToYmdHm: toYmdHm(dateTo, true),
    });
    return NextResponse.json({ items });
  } catch (err) {
    console.error("나라장터 검색 실패:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "검색 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
