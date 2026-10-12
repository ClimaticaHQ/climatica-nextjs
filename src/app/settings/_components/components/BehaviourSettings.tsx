import { ToggleSwitch } from "@/components/UI";
import { useTranslations } from "next-intl";
import { BEHAVIOUR_SETTINGS, SETTINGS_SECTION_IDS } from "../Settings.constant";
import type { TSettingsViewProps } from "../Settings.type";
import { SettingsGroup } from "./SettingsGroup";

/** How the charts and filters behave: auto-apply, the city across pages, scrolling to results. */
export function BehaviourSettings({ page }: TSettingsViewProps) {
  const t = useTranslations();
  const { settings, onSettingChange } = page;

  return (
    <SettingsGroup
      id={SETTINGS_SECTION_IDS.CHARTS_AND_FILTERS}
      title={t("settings.sections.chartsAndFilters")}
    >
      {BEHAVIOUR_SETTINGS.map(({ key, labelKey, descriptionKey }) => (
        <ToggleSwitch
          key={key}
          label={t(labelKey)}
          description={t(descriptionKey)}
          checked={settings[key]}
          onChange={() => onSettingChange(key, !settings[key])}
        />
      ))}
    </SettingsGroup>
  );
}
