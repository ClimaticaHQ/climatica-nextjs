import { ToggleSwitch } from "@/components/UI";
import { useTranslations } from "next-intl";
import { BEHAVIOUR_SETTINGS, SETTINGS_ROW_IDS, SETTINGS_SECTION_IDS } from "../Settings.constant";
import type { TSettingsViewProps } from "../Settings.type";
import { BarStylePicker } from "./BarStylePicker";
import { SettingsGroup } from "./SettingsGroup";
import { SettingsRow } from "./SettingsRow";

/**
 * How the charts and filters behave: auto-apply, the city and the filters across pages,
 * scrolling to results, and how a comparison overlay's bars tell its series apart.
 */
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
      <SettingsRow
        labelId={SETTINGS_ROW_IDS.BAR_STYLE}
        label={t("settings.chartBarStyle")}
        description={t("settings.descriptions.chartBarStyle")}
        hasWideControl
      >
        <BarStylePicker
          labelId={SETTINGS_ROW_IDS.BAR_STYLE}
          value={settings.chartBarStyle}
          onChange={(barStyle) => onSettingChange("chartBarStyle", barStyle)}
        />
      </SettingsRow>
    </SettingsGroup>
  );
}
