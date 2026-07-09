"use client";

import { useState } from "react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";

interface SummarizeResult {
  summary: string;
  eligibility: string[];
  deadline: string;
}

interface AiSummaryCardProps {
  text: string;
}

type Status = "idle" | "loading" | "success" | "error";

export function AiSummaryCard({ text }: AiSummaryCardProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<SummarizeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const hasText = text.trim().length > 0;

  async function handleSummarize() {
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "요약 생성에 실패했습니다.");
        setStatus("error");
        return;
      }
      setResult(data);
      setStatus("success");
    } catch {
      setErrorMessage("네트워크 오류로 요약을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.");
      setStatus("error");
    }
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">AI 요약 (Gemini)</h2>
        <Button
          variant="secondary"
          onClick={handleSummarize}
          disabled={!hasText || status === "loading"}
        >
          {status === "loading" ? "요약 생성 중…" : "AI로 요약하기"}
        </Button>
      </div>

      {!hasText && (
        <p className="text-sm text-mute">원문이 없어 AI 요약을 사용할 수 없습니다.</p>
      )}

      {status === "error" && <p className="text-sm text-error">{errorMessage}</p>}

      {status === "success" && result && (
        <div className="flex flex-col gap-3">
          <Badge tone="amber">
            ⚠ AI가 생성한 요약입니다. 참고용으로만 사용하고 원문을 반드시 확인하세요.
          </Badge>

          <div>
            <p className="text-sm font-medium text-body">핵심 요약</p>
            <p className="text-sm text-ink">{result.summary || "-"}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-body">참가 자격</p>
            {result.eligibility.length > 0 ? (
              <ul className="list-inside list-disc text-sm text-ink">
                {result.eligibility.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-mute">-</p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-body">마감일</p>
            <p className="text-sm text-ink">{result.deadline || "-"}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
