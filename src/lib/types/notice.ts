export interface ExtractedField<T> {
  value: T | null;
  raw?: string | null;
  matched: boolean;
}

export interface ExtractedFields {
  title: ExtractedField<string>;
  organization: ExtractedField<string>;
  estimatedAmount: ExtractedField<number>;
  serviceDuration: ExtractedField<string>;
  deadline: ExtractedField<string>;
  eligibility: ExtractedField<string[]>;
  submissionDocuments: ExtractedField<string[]>;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  addedManually?: boolean;
}

export interface NaraSource {
  bizType: "servc" | "cnstwk";
  bidNtceNo: string;
  bidNtceOrd: string;
}

export interface NoticeCard {
  id: string;
  createdAt: number;
  updatedAt: number;
  sourceFileName: string;
  rawLines: string[];
  extracted: ExtractedFields;
  checklist: ChecklistItem[];
  userNotes?: string;
  /** 나라장터 API로 가져온 공고인 경우에만 존재. PDF 업로드로 만든 공고는 없음. */
  naraSource?: NaraSource | null;
}

export function emptyExtractedField<T>(): ExtractedField<T> {
  return { value: null, raw: null, matched: false };
}
