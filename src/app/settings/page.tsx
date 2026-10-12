import { Settings } from "@/app/settings/_components/Settings";
import { APP_TITLE, ROUTES } from "@/constants";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.settings");
  return {
    title: `${t("title")} | ${APP_TITLE}`,
    description: t("description"),
    alternates: { canonical: ROUTES.SETTINGS },
  };
}

export default function SettingsPage() {
  return <Settings />;
}
