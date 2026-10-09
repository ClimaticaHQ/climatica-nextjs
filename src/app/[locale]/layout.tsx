import { APP_TITLE, MOTION_CSS_VARIABLES } from "@/constants";
import { AppLayout } from "@/layouts";
import { env } from "@/libs/Env";
import { parseLocale, routing } from "@/libs/I18nRouting";
import "@/styles/global.css";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Providers } from "../providers";

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      // * the motion settings, for src/styles/animations.css
      style={MOTION_CSS_VARIABLES}
    >
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
