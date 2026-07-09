"use client";

import { useState } from "react";
import type { NoticeCard } from "@/lib/types/notice";
import type {
  NaraAttachmentItem,
  NaraChangeHistoryItem,
  NaraLicenseLimitItem,
  NaraParticipationRegionItem,
} from "@/lib/naraMarket/types";
import { showToast } from "@/lib/utils/toast";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";

interface NaraLiveInfoPanelProps {
  naraSource: NonNullable<NoticeCard["naraSource"]>;
}

interface LoadedState {
  licenseLimits: NaraLicenseLimitItem[];
  participationRegions: NaraParticipationRegionItem[];
  attachments: NaraAttachmentItem[];
  changes: NaraChangeHistoryItem[];
}

export function NaraLiveInfoPanel({ naraSource }: NaraLiveInfoPanelProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "loaded">("idle");
  const [data, setData] = useState<LoadedState | null>(null);

  async function handleRefresh() {
    setStatus("loading");
    try {
      const { bizType, bidNtceNo, bidNtceOrd } = naraSource;
      const noticeParams = new URLSearchParams({ bizType, bidNtceNo, bidNtceOrd });
      const changesParams = new URLSearchParams({ bizType, bidNtceNo });

      const [noticeRes, changesRes] = await Promise.all([
        fetch(`/api/nara/notice?${noticeParams.toString()}`),
        fetch(`/api/nara/changes?${changesParams.toString()}`),
      ]);
      const noticeData = await noticeRes.json();
      const changesData = await changesRes.json();
      if (!noticeRes.ok) throw new Error(noticeData.error ?? "정보를 불러오지 못했습니다.");
      if (!changesRes.ok) throw new Error(changesData.error ?? "변경이력을 불러오지 못했습니다.");

      setData({
        licenseLimits: noticeData.licenseLimits ?? [],
        participationRegions: noticeData.participationRegions ?? [],
        attachments: noticeData.attachments ?? [],
        changes: changesData.items ?? [],
      });
      setStatus("loaded");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "나라장터 정보를 불러오는 중 오류가 발생했습니다.",
      );
      setStatus("idle");
    }
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold tracking-[-0.6px] text-ink">나라장터 실시간 정보</h2>
        <Button variant="secondary" onClick={handleRefresh} disabled={status === "loading"}>
          {status === "loading" ? "불러오는 중…" : "최신 정보 불러오기"}
        </Button>
      </div>
      <p className="text-xs text-mute">
        면허제한·참가가능지역·e발주 첨부파일·변경이력을 조달청 공공데이터포털에서 실시간으로
        조회합니다.
      </p>

      {data && (
        <div className="flex flex-col gap-4 border-t border-hairline pt-3">
          <section>
            <h3 className="mb-1 text-sm font-medium text-ink">면허제한정보</h3>
            {data.licenseLimits.length === 0 ? (
              <p className="text-sm text-mute">면허제한 정보가 없습니다.</p>
            ) : (
              <ul className="list-inside list-disc text-sm text-body">
                {data.licenseLimits.map((l, i) => (
                  <li key={i}>
                    {l.lcnsLmtNm ?? "-"}
                    {l.permsnIndstrytyList ? ` — 허용업종: ${l.permsnIndstrytyList}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="mb-1 text-sm font-medium text-ink">참가가능지역</h3>
            {data.participationRegions.length === 0 ? (
              <p className="text-sm text-mute">지역 제한 정보가 없습니다 (전국 참가 가능일 수 있음).</p>
            ) : (
              <p className="text-sm text-body">
                {data.participationRegions
                  .map((r) => r.prtcptPsblRgnNm)
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </section>

          <section>
            <h3 className="mb-1 text-sm font-medium text-ink">e발주 첨부파일</h3>
            {data.attachments.length === 0 ? (
              <p className="text-sm text-mute">e발주 첨부파일이 없습니다.</p>
            ) : (
              <ul className="flex flex-col gap-1 text-sm">
                {data.attachments.map((a, i) => (
                  <li key={i}>
                    {a.eorderAtchFileUrl ? (
                      <a
                        href={a.eorderAtchFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link hover:underline"
                      >
                        [{a.eorderDocDivNm ?? "첨부"}] {a.eorderAtchFileNm ?? a.eorderAtchFileUrl}
                      </a>
                    ) : (
                      <span className="text-body">{a.eorderAtchFileNm ?? "-"}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="mb-1 text-sm font-medium text-ink">변경이력</h3>
            {data.changes.length === 0 ? (
              <p className="text-sm text-mute">변경이력이 없습니다.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-sm">
                {data.changes.map((c, i) => (
                  <li key={i} className="border-t border-hairline pt-1.5 first:border-t-0 first:pt-0">
                    <span className="text-mute">{c.chgDt}</span> ·{" "}
                    <span className="text-body">{c.chgItemNm ?? c.chgDataDivNm}</span>
                    {(c.bfchgVal || c.afchgVal) && (
                      <span className="block text-xs text-mute">
                        {c.bfchgVal ?? "-"} → {c.afchgVal ?? "-"}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Card>
  );
}
