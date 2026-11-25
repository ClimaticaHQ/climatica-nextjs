import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { version } from "./package.json";
import { REFERRER_POLICY } from "./src/constants/referrerPolicy.constant";

const withNextIntl = createNextIntlPlugin("./src/libs/I18n.ts");

const nextConfig: NextConfig = {
  // * the analytics e2e server (playwright.config.ts) builds apart: a second `next dev` can't
  // * share .next (its lockfile), and its inlined GA ID mustn't reach the usual build
  distDir: process.env["NEXT_DIST_DIR"] ?? ".next",
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
  // * explicit, never the browser's guess: map tiles must carry our origin (OSM tile usage policy)
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "Referrer-Policy", value: REFERRER_POLICY }] }];
  },
  logging: {
    incomingRequests: {
      ignore: [/^\/api\/worldclim/, /\.well-known/],
    },
  },
};

export default withNextIntl(nextConfig);
