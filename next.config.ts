import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { version } from "./package.json";

const withNextIntl = createNextIntlPlugin("./src/libs/I18n.ts");

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  // * package.json's version, inlined at build time: importing package.json from app code would
  // * ship the whole file to the browser
  env: { NEXT_PUBLIC_APP_VERSION: version },
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
