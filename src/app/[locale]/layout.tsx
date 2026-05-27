import { APP_TITLE } from "@/constants";
import { parseLocale, routing } from "@/libs/I18nRouting";
import { AppLayout } from "@/layouts";
import "@/styles/global.css";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Providers } from "../providers";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: "Climate data visualization",
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
    <html lang={locale} suppressHydrationWarning>
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
