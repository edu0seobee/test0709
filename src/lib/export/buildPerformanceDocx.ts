import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { ProjectRecord, EngineerRecord } from "@/lib/types/profile";

function headerCell(text: string): TableCell {
  return new TableCell({
    width: { size: 20, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
  });
}

function bodyCell(text: string): TableCell {
  return new TableCell({
    children: [new Paragraph(text || "-")],
  });
}

function buildProjectTable(records: ProjectRecord[]): Table | Paragraph {
  if (records.length === 0) {
    return new Paragraph("등록된 유사용역 실적이 없습니다.");
  }

  const headerRow = new TableRow({
    children: [
      headerCell("사업(용역)명"),
      headerCell("발주처"),
      headerCell("계약금액"),
      headerCell("계약기간"),
      headerCell("개요"),
    ],
  });

  const rows = records.map(
    (r) =>
      new TableRow({
        children: [
          bodyCell(r.projectName),
          bodyCell(r.client),
          bodyCell(r.contractAmount ?? ""),
          bodyCell(r.contractPeriod),
          bodyCell(r.description ?? ""),
        ],
      }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...rows],
  });
}

function buildEngineerTable(engineers: EngineerRecord[]): Table | Paragraph {
  if (engineers.length === 0) {
    return new Paragraph("등록된 기술자 경력이 없습니다.");
  }

  const headerRow = new TableRow({
    children: [headerCell("성명"), headerCell("직급/직책"), headerCell("경력 요약")],
  });

  const rows = engineers.map(
    (e) =>
      new TableRow({
        children: [
          bodyCell(e.name),
          bodyCell(e.position ?? ""),
          bodyCell(e.careerSummary),
        ],
      }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...rows],
  });
}

export async function buildPerformanceDocx(
  projectRecords: ProjectRecord[],
  engineers: EngineerRecord[],
): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: "유사용역 수행실적 및 기술자 경력",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: "1. 유사용역 수행실적",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
          }),
          buildProjectTable(projectRecords),
          new Paragraph({
            text: "2. 투입 기술자 경력",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 150 },
          }),
          buildEngineerTable(engineers),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}
