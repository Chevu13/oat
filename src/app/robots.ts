import type { MetadataRoute } from "next";
import { site } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    // AI search crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…) are allowed on public pages on purpose.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/placanje", "/porudzbina", "/api"] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
