/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // The reference Express backend lives in apps/backend and is not part of the
  // Next.js build. It documents the original service architecture; the runtime
  // API is implemented as App Router route handlers under app/api.
  outputFileTracingExcludes: {
    '*': ['./apps/backend/**', './apps/contentflow/**'],
  },
}

export default nextConfig
