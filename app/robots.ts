import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mind-reply.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/agent", "/privacy"],
        disallow: ["/api/", "/mcp"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
