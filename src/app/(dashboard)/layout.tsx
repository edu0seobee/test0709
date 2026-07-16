import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchNotices } from "@/lib/supabase/notices";
import { NavHeader } from "@/components/layout/NavHeader";
import { NoticeStoreHydrator } from "@/components/notices/NoticeStoreHydrator";
import type { NoticeCard } from "@/lib/types/notice";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  // The proxy (src/proxy.ts) already redirects unauthenticated requests to
  // /login before they reach here — this is a defensive second check, not
  // the primary line of defense.
  if (!data?.claims) {
    redirect("/login");
  }

  const email = (data.claims as { email?: string }).email ?? null;

  // Seed the notice list server-side so page/compare/detail don't all repeat
  // the same client-only fetch waterfall on first load. If this fails, the
  // store stays "idle" and useEnsureNoticesLoaded()'s client fetch (with its
  // existing error toast) is the fallback.
  let initialNotices: NoticeCard[] | null = null;
  try {
    initialNotices = await fetchNotices(supabase);
  } catch (error) {
    console.error("Server-side fetchNotices failed:", error);
  }

  return (
    <>
      <NavHeader userEmail={email} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
      {initialNotices && <NoticeStoreHydrator initialNotices={initialNotices} />}
    </>
  );
}
