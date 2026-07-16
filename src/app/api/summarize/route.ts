import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const MAX_INPUT_LENGTH = 12000;
const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

type ErrorCode = "EMPTY_INPUT" | "RATE_LIMIT" | "FAILED";

interface SummarizeResult {
  summary: string;
  eligibility: string[];
  deadline: string;
}

function errorResponse(message: string, code: ErrorCode, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

function classifyError(err: unknown): "RATE_LIMIT" | "FAILED" {
  const message = err instanceof Error ? err.message : String(err);
  const status = (err as { status?: number } | null)?.status;
  if (status === 429 || /RESOURCE_EXHAUSTED|quota|rate.?limit/i.test(message)) {
    return "RATE_LIMIT";
  }
  return "FAILED";
}

/** Gemini is asked to return JSON only, but models sometimes wrap it in prose/fences — pull out the first {...} block defensively. */
function extractJson(text: string): SummarizeResult | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      eligibility: Array.isArray(parsed.eligibility)
        ? parsed.eligibility.filter((v: unknown): v is string => typeof v === "string")
        : [],
      deadline: typeof parsed.deadline === "string" ? parsed.deadline : "확인 필요",
    };
  } catch {
    return null;
  }
}

function buildPrompt(noticeText: string): string {
  return `다음은 나라장터 입찰 공고문 원문입니다. 이 내용을 바탕으로 아래 JSON 형식으로만 응답하세요. 다른 설명, 마크다운, 코드블록 없이 JSON 객체만 출력하세요.

{"summary": "공고의 핵심 내용을 2~3문장으로 요약", "eligibility": ["참가자격 요건을 항목별로 나눈 배열"], "deadline": "입찰/제출 마감일시 (원문에 명시된 그대로, 모르면 확인 필요)"}

원문:
"""
${noticeText}
"""`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY가 설정되지 않았습니다.");
    return errorResponse("서버에 AI 요약 기능이 설정되지 않았습니다.", "FAILED", 500);
  }

  let body: { text?: unknown };
  try {
    body = await request.json();
  } catch {
    return errorResponse("요청 형식이 올바르지 않습니다.", "EMPTY_INPUT", 400);
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return errorResponse("요약할 공고 원문이 없습니다.", "EMPTY_INPUT", 400);
  }

  const noticeText =
    text.length > MAX_INPUT_LENGTH ? `${text.slice(0, MAX_INPUT_LENGTH)}\n(이하 생략)` : text;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: buildPrompt(noticeText),
      config: { responseMimeType: "application/json" },
    });

    const result = extractJson(response.text ?? "");
    if (!result) {
      console.error("Gemini 응답을 JSON으로 해석하지 못함:", response.text);
      return errorResponse("요약 생성에 실패했습니다. 잠시 후 다시 시도해주세요.", "FAILED", 500);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Gemini 요약 호출 실패:", err);
    const code = classifyError(err);
    return errorResponse(
      code === "RATE_LIMIT"
        ? "AI 요약 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
        : "요약 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
      code,
      code === "RATE_LIMIT" ? 429 : 500,
    );
  }
}
