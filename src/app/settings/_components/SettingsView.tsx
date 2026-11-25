"use client";

import { Card } from "@/components/Card";
import { PageLayout } from "@/components/page";
import { ECardPadding } from "@/enums";
import { useTranslations } from "next-intl";
import { AppearanceSettings } from "./components/AppearanceSettings";
import { BehaviourSettings } from "./components/BehaviourSettings";
import { LanguageSettings } from "./components/LanguageSettings";
import { PrivacySettings } from "./components/PrivacySettings";
import { SETTINGS_CLASSES as C } from "./Settings.constant";
import type { TSettingsViewProps } from "./Settings.type";

export function SettingsView({ page }: TSettingsViewProps) {
  const t = useTranslations();

  return (
    <PageLayout
      title={t("pages.settings.title")}
      description={t("pages.settings.description")}
      main={
        <Card padding={ECardPadding.NONE} className={C.CARD}>
          <LanguageSettings page={page} />
          <AppearanceSettings page={page} />
          <BehaviourSettings page={page} />
          {page.analytics.isShown && <PrivacySettings page={page} />}
        </Card>
      }
    />
  );
}
