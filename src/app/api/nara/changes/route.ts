import { NextResponse } from "next/server";
import { fetchNaraChangeHistory } from "@/lib/naraMarket/client";
import type { NaraBizType } from "@/lib/naraMarket/types";

export const runtime = "nodejs";

function isBizType(value: string | null): value is NaraBizType {
  return value === "servc" || value === "cnstwk";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bizType = searchParams.get("bizType");
  const bidNtceNo = searchParams.get("bidNtceNo");

  if (!isBizType(bizType) || !bidNtceNo) {
    return NextResponse.json({ error: "bizType과 bidNtceNo가 필요합니다." }, { status: 400 });
  }

  try {
    const items = await fetchNaraChangeHistory(bizType, bidNtceNo);
    return NextResponse.json({ items });
  } catch (err) {
    console.error("나라장터 변경이력 조회 실패:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "변경이력 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
