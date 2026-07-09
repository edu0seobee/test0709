"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/common/Button";

const NAV_ITEMS = [
  { href: "/", label: "공고 목록" },
  { href: "/compare", label: "공고 비교" },
  { href: "/performance", label: "실적·경력 관리" },
];

interface NavHeaderProps {
  userEmail?: string | null;
}

export function NavHeader({ userEmail }: NavHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-hairline bg-canvas">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0">
        <Link href="/" className="text-lg font-semibold tracking-[-0.6px] text-ink">
          입찰 공고 분석기
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                    "rounded-full px-3 py-1.5 text-sm font-medium tracking-[-0.28px] transition-colors",
                    active
                      ? "bg-canvas-soft-2 text-ink"
                      : "text-body hover:bg-canvas-soft",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 border-l border-hairline pl-3">
            {userEmail && (
              <span className="hidden text-xs text-mute sm:inline">{userEmail}</span>
            )}
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={signingOut}
              className="px-2.5 py-1 text-xs"
            >
              {signingOut ? "로그아웃 중…" : "로그아웃"}
            </Button>
          </div>
        </div>
      </div>
      <div className="border-t border-hairline bg-canvas-soft px-4 py-1.5 text-center text-xs text-body">
        공고·체크리스트는 데이터베이스에 저장되어 다른 기기에서도 동일하게 보입니다. (실적·경력 정보는 이 브라우저에만 저장됩니다)
      </div>
    </header>
  );
}
