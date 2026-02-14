import type { NextConfig } from "next";

const apiOrigin = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s4.anilist.co",
        pathname: "/file/anilistcdn/**",
      },
    ]
  },
  async rewrites() {
    if (!apiOrigin) return [];

    return [
      {
        source: "/proxy/:path*",
        destination: `${apiOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
