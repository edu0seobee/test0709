import type { MetadataRoute } from "next";

// Every route is login-gated (see src/lib/supabase/proxy.ts) — nothing here
// is worth crawling, so keep crawlers off entirely.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
