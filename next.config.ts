import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/libs/I18n.ts");

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  // react-leaflet 4.x is incompatible with React Strict Mode (double-invokes refs)
  reactStrictMode: false,
  experimental: {
    webpackMemoryOptimizations: true,
    preloadEntriesOnStart: false,
  },
  logging: {
    incomingRequests: {
      ignore: [/^\/api\/worldclim/, /\.well-known/],
    },
  },
};

export default withNextIntl(nextConfig);
