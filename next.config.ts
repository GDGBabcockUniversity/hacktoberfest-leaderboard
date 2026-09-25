import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  images: {
    remotePatterns: [
      { hostname: "avatars.githubusercontent.com", protocol: "https", pathname: "**" },
      {
        hostname: "github.com",
        pathname: "**",
        protocol: "https",
        port: "",
      },
    ],
  },
};
export default nextConfig;
