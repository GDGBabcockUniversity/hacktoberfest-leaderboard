import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
const nextConfig: NextConfig = {
  output: "standalone",
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
export default function config(phase: string): NextConfig {
  return {
    ...nextConfig,
    // A production build must not overwrite a running dev server's chunks.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  };
}
