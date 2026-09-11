import { OG_IMAGE_COLORS, OG_IMAGE_SIZE } from "@/constants";
import { parseLocale } from "@/libs/I18nRouting";
import { resolveOgMeta } from "@/utils";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";

const logoDataUri = `data:image/svg+xml;base64,${fs
  .readFileSync(path.join(process.cwd(), "src/assets/climatica-logo.svg"))
  .toString("base64")}`;

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const locale = parseLocale(searchParams["locale"]);
  const route = searchParams["route"];

  const { title, description } = await resolveOgMeta({ route, locale, searchParams });

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        backgroundColor: OG_IMAGE_COLORS.dark,
        backgroundImage: `linear-gradient(135deg, ${OG_IMAGE_COLORS.dark} 0%, ${OG_IMAGE_COLORS.primary} 100%)`,
        fontFamily: "sans-serif",
        color: OG_IMAGE_COLORS.onPrimary,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: OG_IMAGE_COLORS.onPrimary,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori (next/og) requires plain <img>, not next/image */}
          <img src={logoDataUri} width={44} height={37} alt="" />
        </div>
        <span style={{ fontSize: 32, fontWeight: 700 }}>Climatica</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 980 }}>
        <div style={{ display: "flex", fontSize: 56, fontWeight: 800, lineHeight: 1.15 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 30, opacity: 0.85, lineHeight: 1.3 }}>
          {description}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 22, opacity: 0.65 }}>climatica.gsic.uva.es</div>
    </div>,
    { width: OG_IMAGE_SIZE.width, height: OG_IMAGE_SIZE.height },
  );
}
