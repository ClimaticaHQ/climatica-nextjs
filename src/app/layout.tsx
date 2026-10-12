import { APP_TITLE, MOTION_CSS_VARIABLES, THEME_INIT_SCRIPT } from "@/constants";
import { AppLayout } from "@/layouts";
import { env } from "@/libs/Env";
import "@/styles/global.css";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: APP_TITLE,
  description: "Climate data visualization",
};

// * cover: the page reaches under the notch and home indicator — everything pinned to an edge
// * pads itself with env(safe-area-inset-*)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      // * the head script sets the theme class before React hydrates
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      // * the motion settings, for src/styles/animations.css
      style={MOTION_CSS_VARIABLES}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <Providers>
          <NextIntlClientProvider>
            <AppLayout>{children}</AppLayout>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
