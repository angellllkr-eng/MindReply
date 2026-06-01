import { NextResponse } from 'next/server';

export function GET(): NextResponse {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agencycomm.app';

  const content = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
