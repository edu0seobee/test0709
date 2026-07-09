import type {
  NaraAttachmentItem,
  NaraBizType,
  NaraChangeHistoryItem,
  NaraLicenseLimitItem,
  NaraNoticeDetail,
  NaraParticipationRegionItem,
  NaraSearchResultItem,
} from "./types";

// 조달청 공공데이터포털 "나라장터 입찰공고정보서비스" (BidPublicInfoService)
const BASE_URL = "https://apis.data.go.kr/1230000/ad/BidPublicInfoService";

const PPS_SRCH_OPERATION: Record<NaraBizType, string> = {
  servc: "getBidPblancListInfoServcPPSSrch",
  cnstwk: "getBidPblancListInfoCnstwkPPSSrch",
};

const LIST_OPERATION: Record<NaraBizType, string> = {
  servc: "getBidPblancListInfoServc",
  cnstwk: "getBidPblancListInfoCnstwk",
};

const CHG_HSTRY_OPERATION: Record<NaraBizType, string> = {
  servc: "getBidPblancListInfoChgHstryServc",
  cnstwk: "getBidPblancListInfoChgHstryCnstwk",
};

function getServiceKey(): string {
  const key = process.env.DATA_GO_KR_SERVICE_KEY;
  if (!key) {
    throw new Error("DATA_GO_KR_SERVICE_KEY 환경변수가 설정되지 않았습니다.");
  }
  return key;
}

function toNumberOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function toStringOrNull(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

interface RawApiEnvelope {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: { items?: unknown; totalCount?: number };
  };
}

async function callNaraApi(
  operation: string,
  params: Record<string, string | number | undefined>,
): Promise<Record<string, unknown>[]> {
  const query = new URLSearchParams();
  query.set("ServiceKey", getServiceKey());
  query.set("type", "json");
  query.set("numOfRows", String(params.numOfRows ?? 100));
  query.set("pageNo", String(params.pageNo ?? 1));
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || key === "numOfRows" || key === "pageNo") continue;
    query.set(key, String(value));
  }

  const res = await fetch(`${BASE_URL}/${operation}?${query.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`나라장터 API 호출 실패 (${operation}): HTTP ${res.status}`);
  }

  const data = (await res.json()) as RawApiEnvelope;
  const header = data.response?.header;
  if (!header || header.resultCode !== "00") {
    throw new Error(`나라장터 API 오류 (${operation}): ${header?.resultMsg ?? "알 수 없는 오류"}`);
  }

  const rawItems = data.response?.body?.items;
  if (Array.isArray(rawItems)) return rawItems as Record<string, unknown>[];
  if (rawItems && typeof rawItems === "object") {
    const inner = (rawItems as { item?: unknown }).item;
    if (Array.isArray(inner)) return inner as Record<string, unknown>[];
    if (inner && typeof inner === "object") return [inner as Record<string, unknown>];
  }
  return [];
}

function mapSearchItem(bizType: NaraBizType, raw: Record<string, unknown>): NaraSearchResultItem {
  return {
    bizType,
    bidNtceNo: String(raw.bidNtceNo ?? ""),
    bidNtceOrd: String(raw.bidNtceOrd ?? "000"),
    bidNtceNm: toStringOrNull(raw.bidNtceNm) ?? "(공고명 없음)",
    ntceInsttNm: toStringOrNull(raw.ntceInsttNm) ?? "",
    dminsttNm: toStringOrNull(raw.dminsttNm) ?? "",
    bidNtceDt: toStringOrNull(raw.bidNtceDt),
    bidClseDt: toStringOrNull(raw.bidClseDt),
    opengDt: toStringOrNull(raw.opengDt),
    presmptPrce: toNumberOrNull(raw.presmptPrce),
  };
}

export async function searchNaraNotices(params: {
  bizTypes: NaraBizType[];
  keyword?: string;
  institution?: string;
  dateFromYmdHm: string;
  dateToYmdHm: string;
}): Promise<NaraSearchResultItem[]> {
  const results = await Promise.all(
    params.bizTypes.map(async (bizType) => {
      const raws = await callNaraApi(PPS_SRCH_OPERATION[bizType], {
        inqryDiv: 1,
        inqryBgnDt: params.dateFromYmdHm,
        inqryEndDt: params.dateToYmdHm,
        bidNtceNm: params.keyword,
        ntceInsttNm: params.institution,
        numOfRows: 100,
      });
      return raws.map((raw) => mapSearchItem(bizType, raw));
    }),
  );
  return results.flat().sort((a, b) => (b.bidNtceDt ?? "").localeCompare(a.bidNtceDt ?? ""));
}

function mapDetailItem(bizType: NaraBizType, raw: Record<string, unknown>): NaraNoticeDetail {
  const specDocs: NaraNoticeDetail["specDocs"] = [];
  for (let i = 1; i <= 10; i++) {
    const url = toStringOrNull(raw[`ntceSpecDocUrl${i}`]);
    const name = toStringOrNull(raw[`ntceSpecFileNm${i}`]);
    if (url || name) specDocs.push({ name: name ?? `첨부파일 ${i}`, url: url ?? "" });
  }

  return {
    ...mapSearchItem(bizType, raw),
    cntrctCnclsMthdNm: toStringOrNull(raw.cntrctCnclsMthdNm),
    bidMethdNm: toStringOrNull(raw.bidMethdNm),
    indstrytyLmtYn: toStringOrNull(raw.indstrytyLmtYn),
    bidPrtcptLmtYn: toStringOrNull(raw.bidPrtcptLmtYn),
    cmmnSpldmdMethdNm: toStringOrNull(raw.cmmnSpldmdMethdNm),
    rgnDutyJntcontrctYn: toStringOrNull(raw.rgnDutyJntcontrctYn),
    bdgtAmt: toNumberOrNull(raw.bdgtAmt),
    asignBdgtAmt: toNumberOrNull(raw.asignBdgtAmt),
    specDocs,
    stdNtceDocUrl: toStringOrNull(raw.stdNtceDocUrl),
    bidNtceUrl: toStringOrNull(raw.bidNtceDtlUrl) ?? toStringOrNull(raw.bidNtceUrl),
  };
}

export async function fetchNaraNoticeDetail(
  bizType: NaraBizType,
  bidNtceNo: string,
): Promise<NaraNoticeDetail | null> {
  const raws = await callNaraApi(LIST_OPERATION[bizType], {
    inqryDiv: 2,
    bidNtceNo,
    numOfRows: 5,
  });
  if (raws.length === 0) return null;
  return mapDetailItem(bizType, raws[0]);
}

export async function fetchNaraChangeHistory(
  bizType: NaraBizType,
  bidNtceNo: string,
): Promise<NaraChangeHistoryItem[]> {
  const raws = await callNaraApi(CHG_HSTRY_OPERATION[bizType], {
    inqryDiv: 2,
    bidNtceNo,
    numOfRows: 100,
  });
  return raws.map((raw) => ({
    chgDt: toStringOrNull(raw.chgDt) ?? "",
    chgDataDivNm: toStringOrNull(raw.chgDataDivNm) ?? "",
    chgItemNm: toStringOrNull(raw.chgItemNm),
    bfchgVal: toStringOrNull(raw.bfchgVal),
    afchgVal: toStringOrNull(raw.afchgVal),
  }));
}

export async function fetchNaraLicenseLimits(
  bidNtceNo: string,
  bidNtceOrd: string,
): Promise<NaraLicenseLimitItem[]> {
  const raws = await callNaraApi("getBidPblancListInfoLicenseLimit", {
    inqryDiv: 2,
    bidNtceNo,
    bidNtceOrd,
    numOfRows: 50,
  });
  return raws.map((raw) => ({
    lmtGrpNo: toStringOrNull(raw.lmtGrpNo),
    lcnsLmtNm: toStringOrNull(raw.lcnsLmtNm),
    permsnIndstrytyList: toStringOrNull(raw.permsnIndstrytyList),
  }));
}

export async function fetchNaraParticipationRegions(
  bidNtceNo: string,
  bidNtceOrd: string,
): Promise<NaraParticipationRegionItem[]> {
  const raws = await callNaraApi("getBidPblancListInfoPrtcptPsblRgn", {
    inqryDiv: 2,
    bidNtceNo,
    bidNtceOrd,
    numOfRows: 50,
  });
  return raws.map((raw) => ({ prtcptPsblRgnNm: toStringOrNull(raw.prtcptPsblRgnNm) }));
}

export async function fetchNaraAttachments(bidNtceNo: string): Promise<NaraAttachmentItem[]> {
  const raws = await callNaraApi("getBidPblancListInfoEorderAtchFileInfo", {
    inqryDiv: 2,
    bidNtceNo,
    numOfRows: 50,
  });
  return raws.map((raw) => ({
    eorderDocDivNm: toStringOrNull(raw.eorderDocDivNm),
    eorderAtchFileNm: toStringOrNull(raw.eorderAtchFileNm),
    eorderAtchFileUrl: toStringOrNull(raw.eorderAtchFileUrl),
  }));
}
