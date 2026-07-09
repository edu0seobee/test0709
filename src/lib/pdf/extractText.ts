import type { TextItem } from "pdfjs-dist/types/src/display/api";

let workerConfigured = false;
let pdfjsLibPromise: Promise<typeof import("pdfjs-dist")> | null = null;

// pdfjs-dist touches browser-only globals (DOMMatrix, etc.) at module load
// time, which crashes Next.js's server-side render of this client component.
// A dynamic import defers loading until this function actually runs, which
// only happens in the browser (triggered by a user file selection).
async function loadPdfjs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import("pdfjs-dist");
  }
  const pdfjsLib = await pdfjsLibPromise;

  if (!workerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    workerConfigured = true;
  }

  return pdfjsLib;
}

export interface ExtractedPdfText {
  lines: string[];
  fullText: string;
  pageCount: number;
  /** True when almost no text layer was found — likely a scanned/image PDF. */
  likelyScanned: boolean;
}

const MIN_TEXT_LENGTH_PER_PAGE = 20;

export async function extractPdfText(file: File): Promise<ExtractedPdfText> {
  const pdfjsLib = await loadPdfjs();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const lines: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    let currentLine = "";
    for (const rawItem of textContent.items) {
      if (!("str" in rawItem)) continue;
      const item = rawItem as TextItem;
      currentLine += item.str;
      if (item.hasEOL) {
        lines.push(currentLine.trim());
        currentLine = "";
      }
    }
    if (currentLine.trim().length > 0) {
      lines.push(currentLine.trim());
    }
    lines.push("");
  }

  const filteredLines = lines.filter((line) => line.length > 0);
  const fullText = filteredLines.join("\n");

  return {
    lines: filteredLines,
    fullText,
    pageCount: pdf.numPages,
    likelyScanned:
      fullText.replace(/\s/g, "").length < MIN_TEXT_LENGTH_PER_PAGE * pdf.numPages,
  };
}
