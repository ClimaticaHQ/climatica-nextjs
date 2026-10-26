"use client";

import { Card } from "@/components/Card";
import { PageLayout } from "@/components/page";
import { useTranslations } from "next-intl";
import { AppearanceSettings } from "./components/AppearanceSettings";
import { BehaviourSettings } from "./components/BehaviourSettings";
import { LanguageSettings } from "./components/LanguageSettings";
import { SETTINGS_CLASSES as C } from "./Settings.constant";
import type { TSettingsViewProps } from "./Settings.type";

export function SettingsView({ page }: TSettingsViewProps) {
  const t = useTranslations();

  return (
    <PageLayout
      title={t("pages.settings.title")}
      description={t("pages.settings.description")}
      main={
        <Card className={C.CARD}>
          <div className={C.GROUPS}>
            <LanguageSettings page={page} />
            <AppearanceSettings page={page} />
            <BehaviourSettings page={page} />
          </div>
        </Card>
      }
    />
  );
}
