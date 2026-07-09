import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavHeader } from "@/components/layout/NavHeader";

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

  return (
    <>
      <NavHeader userEmail={email} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </>
  );
}
