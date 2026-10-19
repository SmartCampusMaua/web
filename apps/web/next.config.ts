import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@smartcampus/types"],
  allowedDevOrigins: ["https://iot.maua.br"],
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),

  async rewrites() {
    return [
      {
        source: "/api-iot/:path*",
        destination: "https://iot.maua.br/api/:path*", // O Next.js busca aqui no servidor (CORS livre)
      },
    ];''
  },
};


export default nextConfig;
