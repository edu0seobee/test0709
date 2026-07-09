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

export interface NoticeCard {
  id: string;
  createdAt: number;
  updatedAt: number;
  sourceFileName: string;
  rawLines: string[];
  extracted: ExtractedFields;
  checklist: ChecklistItem[];
  userNotes?: string;
}

export function emptyExtractedField<T>(): ExtractedField<T> {
  return { value: null, raw: null, matched: false };
}
