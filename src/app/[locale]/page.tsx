import { parseLocale } from "@/libs/I18nRouting";
import { redirect } from "@/libs/I18nNavigation";
import { setRequestLocale } from "next-intl/server";

export default async function RootPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = parseLocale((await params).locale);
  setRequestLocale(locale);
  redirect({ href: "/climate-statistics", locale });
}
