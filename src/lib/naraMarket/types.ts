export type NaraBizType = "servc" | "cnstwk";

export interface NaraSearchResultItem {
  bizType: NaraBizType;
  bidNtceNo: string;
  bidNtceOrd: string;
  bidNtceNm: string;
  ntceInsttNm: string;
  dminsttNm: string;
  bidNtceDt: string | null;
  bidClseDt: string | null;
  opengDt: string | null;
  presmptPrce: number | null;
}

export interface NaraSpecDoc {
  name: string;
  url: string;
}

export interface NaraNoticeDetail extends NaraSearchResultItem {
  cntrctCnclsMthdNm: string | null;
  bidMethdNm: string | null;
  indstrytyLmtYn: string | null;
  bidPrtcptLmtYn: string | null;
  cmmnSpldmdMethdNm: string | null;
  rgnDutyJntcontrctYn: string | null;
  bdgtAmt: number | null;
  asignBdgtAmt: number | null;
  specDocs: NaraSpecDoc[];
  stdNtceDocUrl: string | null;
  bidNtceUrl: string | null;
}

export interface NaraChangeHistoryItem {
  chgDt: string;
  chgDataDivNm: string;
  chgItemNm: string | null;
  bfchgVal: string | null;
  afchgVal: string | null;
}

export interface NaraLicenseLimitItem {
  lmtGrpNo: string | null;
  lcnsLmtNm: string | null;
  permsnIndstrytyList: string | null;
}

export interface NaraParticipationRegionItem {
  prtcptPsblRgnNm: string | null;
}

export interface NaraAttachmentItem {
  eorderDocDivNm: string | null;
  eorderAtchFileNm: string | null;
  eorderAtchFileUrl: string | null;
}
