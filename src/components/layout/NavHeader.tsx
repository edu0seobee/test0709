"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/", label: "공고 목록" },
  { href: "/compare", label: "공고 비교" },
  { href: "/performance", label: "실적·경력 관리" },
];

export function NavHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-bold text-gray-900">
          입찰 공고 분석기
        </Link>
        <nav className="flex gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-800">
        모든 데이터는 이 브라우저에만 저장됩니다. 다른 기기·브라우저에서는 보이지 않고, 브라우저 데이터를 지우면 사라집니다.
      </div>
    </header>
  );
}
