/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

// Change this to your GitHub repo name
const repoName = process.env.NEXT_PUBLIC_REPO_NAME || "letters-to-lions";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
};

module.exports = nextConfig;
