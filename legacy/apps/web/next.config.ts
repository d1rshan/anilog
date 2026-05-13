import type { NextConfig } from "next";
import { webEnv } from "@anilog/env/web";

const apiOrigin = webEnv.NEXT_PUBLIC_SERVER_URL.replace(/\/+$/, "");

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
    ],
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
