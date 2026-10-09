"use client";

import { AnimationSettings } from "@/components/AnimationSettings";
import { CollapsibleSection } from "@/components/UI/CollapsibleSection";
import { ToggleSwitch } from "@/components/UI/ToggleSwitch";
import { useSettingsStore } from "@/stores";
import { useTranslations } from "next-intl";

/** The app's preferences (auto-apply, auto-scroll, city sync, motion) — no filter logic. */
export function FilterSettings() {
  const t = useTranslations();
  const {
    autoScroll,
    toggleAutoScroll,
    syncCity,
    toggleSyncCity,
    autoApplyFilters,
    toggleAutoApplyFilters,
  } = useSettingsStore();

  return (
    <CollapsibleSection
      title={t("sidebar.settings")}
      defaultOpen={false}
      withDivider
      gapBetweenOptions="gap-2"
    >
      <ToggleSwitch
        label={t("sidebar.autoScroll")}
        checked={autoScroll}
        onChange={toggleAutoScroll}
      />
      <ToggleSwitch label={t("sidebar.syncCity")} checked={syncCity} onChange={toggleSyncCity} />
      <ToggleSwitch
        label={t("sidebar.autoApplyFilters")}
        checked={autoApplyFilters}
        onChange={toggleAutoApplyFilters}
      />
      <AnimationSettings />
    </CollapsibleSection>
  );
}
