import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // react-leaflet 4.x is incompatible with React Strict Mode (double-invokes refs)
  reactStrictMode: false,
};

export default nextConfig;
