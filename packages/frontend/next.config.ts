import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@/data": path.resolve(__dirname, "../../data"),
    },
  },
};

export default nextConfig;
