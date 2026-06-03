/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          git remote add github https://github.com/Mind-Reply/MindReply.git
git add -A
git commit -m "feat: Next.js 15 App Router build + Azure deployment pipeline"
git push github main
    git remote add github https://github.com/Mind-Reply/MindReply.git
git add -A
git commit -m "feat: Next.js 15 App Router build + Azure deployment pipeline"
git push github main


          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
