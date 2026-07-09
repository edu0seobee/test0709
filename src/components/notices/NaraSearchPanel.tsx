"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useNoticeStore } from "@/lib/store/useNoticeStore";
import { buildNoticeCardFromNara } from "@/lib/naraMarket/toNoticeCard";
import type { NaraNoticeDetail, NaraSearchResultItem } from "@/lib/naraMarket/types";
import { showToast } from "@/lib/utils/toast";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";

type BizTypeFilter = "all" | "servc" | "cnstwk";

const BIZ_TYPE_OPTIONS: { value: BizTypeFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "servc", label: "용역" },
  { value: "cnstwk", label: "공사" },
];

function todayYmd(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function NaraSearchPanel() {
  const [open, setOpen] = useState(false);
  const [bizType, setBizType] = useState<BizTypeFilter>("all");
  const [keyword, setKeyword] = useState("");
  const [institution, setInstitution] = useState("");
  const [dateFrom, setDateFrom] = useState(() => todayYmd(-14));
  const [dateTo, setDateTo] = useState(() => todayYmd(0));
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading">("idle");
  const [results, setResults] = useState<NaraSearchResultItem[]>([]);
  const [importingKey, setImportingKey] = useState<string | null>(null);

  const addNotice = useNoticeStore((s) => s.addNotice);
  const router = useRouter();

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setSearchStatus("loading");
    setResults([]);
    try {
      const params = new URLSearchParams({ bizType, dateFrom, dateTo });
      if (keyword.trim()) params.set("keyword", keyword.trim());
      if (institution.trim()) params.set("institution", institution.trim());

      const res = await fetch(`/api/nara/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "검색에 실패했습니다.");

      const items: NaraSearchResultItem[] = data.items ?? [];
      setResults(items);
      if (items.length === 0) {
        showToast("검색 결과가 없습니다. 검색 조건을 조정해보세요.");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "검색 중 오류가 발생했습니다.");
    } finally {
      setSearchStatus("idle");
    }
  }

  async function handleImport(item: NaraSearchResultItem) {
    const key = `${item.bizType}:${item.bidNtceNo}`;
    setImportingKey(key);
    try {
      const params = new URLSearchParams({
        bizType: item.bizType,
        bidNtceNo: item.bidNtceNo,
        bidNtceOrd: item.bidNtceOrd,
      });
      const res = await fetch(`/api/nara/notice?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "공고 조회에 실패했습니다.");

      const detail = data.detail as NaraNoticeDetail;
      const card = buildNoticeCardFromNara(detail);
      const created = await addNotice(card);
      if (created) {
        router.push(`/notices/${created.id}`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "가져오기 중 오류가 발생했습니다.");
    } finally {
      setImportingKey(null);
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between text-left"
      >
        <span className="text-base font-medium text-ink">나라장터에서 공고 검색해서 가져오기</span>
        <span className="text-sm text-mute">{open ? "접기 ▲" : "펼치기 ▼"}</span>
      </button>

      {open && (
        <>
          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {BIZ_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBizType(opt.value)}
                  className={clsx(
                    "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                    bizType === opt.value
                      ? "bg-canvas-soft-2 text-ink"
                      : "text-body hover:bg-canvas-soft",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                className="rounded-md border border-hairline px-3 py-2 text-sm text-ink focus:border-link focus:outline-none focus:ring-1 focus:ring-link"
                placeholder="공고명 키워드 (부분 검색)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <input
                className="rounded-md border border-hairline px-3 py-2 text-sm text-ink focus:border-link focus:outline-none focus:ring-1 focus:ring-link"
                placeholder="발주기관명 (부분 검색)"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
              <label className="flex flex-col gap-1 text-xs text-mute">
                공고게시일 시작
                <input
                  type="date"
                  className="rounded-md border border-hairline px-3 py-2 text-sm text-ink focus:border-link focus:outline-none focus:ring-1 focus:ring-link"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-mute">
                공고게시일 종료
                <input
                  type="date"
                  className="rounded-md border border-hairline px-3 py-2 text-sm text-ink focus:border-link focus:outline-none focus:ring-1 focus:ring-link"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </label>
            </div>

            <p className="text-xs text-mute">
              조달청 공공데이터포털 나라장터 입찰공고정보서비스에서 실시간으로 검색합니다.
            </p>

            <Button type="submit" disabled={searchStatus === "loading"}>
              {searchStatus === "loading" ? "검색 중…" : "검색"}
            </Button>
          </form>

          {results.length > 0 && (
            <ul className="flex flex-col gap-2">
              {results.map((item) => {
                const key = `${item.bizType}:${item.bidNtceNo}`;
                return (
                  <li
                    key={key}
                    className="flex flex-col gap-2 rounded-md border border-hairline p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{item.bidNtceNm}</p>
                      <p className="text-xs text-mute">
                        {item.ntceInsttNm || "-"} · {item.bizType === "servc" ? "용역" : "공사"} ·
                        마감 {item.bidClseDt ?? "미확인"} · 추정가격{" "}
                        {formatCurrency(item.presmptPrce)}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      disabled={importingKey === key}
                      onClick={() => handleImport(item)}
                    >
                      {importingKey === key ? "가져오는 중…" : "가져오기"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}
