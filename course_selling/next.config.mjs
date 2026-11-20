/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
    // Optimized variants are regenerated only once a month instead of every
    // 4 hours (the default), so visitors almost always get a cached image.
    // Renaming a file is the way to force a refresh.
    minimumCacheTTL: 2678400,
    // Nothing on the site is wider than the 1600px source images, so don't
    // offer (or generate) the 1920 / 2048 / 3840 variants.
    deviceSizes: [640, 750, 828, 1080, 1200, 1600],
  },
  // Project READMEs are read from disk at render time; make sure they ship
  // with the server bundle so hourly revalidation can re-render the pages.
  outputFileTracingIncludes: {
    "/projects/[slug]": ["./content/projects/**/*"],
  },
  async headers() {
    return [
      {
        // Raw files in /public/images (browser + CDN cache for a day, and keep
        // serving the cached copy while a fresh one is fetched in the background).
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
