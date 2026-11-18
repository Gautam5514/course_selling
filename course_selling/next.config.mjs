/** @type {import('next').NextConfig} */
const nextConfig = {
  // Project READMEs are read from disk at render time; make sure they ship
  // with the server bundle so hourly revalidation can re-render the pages.
  outputFileTracingIncludes: {
    "/projects/[slug]": ["./content/projects/**/*"],
  },
};

export default nextConfig;
