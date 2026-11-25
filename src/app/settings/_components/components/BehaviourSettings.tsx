import { ToggleSwitch } from "@/components/UI";
import { ESettingsControlPlacement } from "@/enums";
import { useTranslations } from "next-intl";
import {
  BEHAVIOUR_SETTINGS,
  SETTINGS_DESCRIPTION_IDS,
  SETTINGS_ROW_IDS,
  SETTINGS_SECTION_IDS,
} from "../Settings.constant";
import type { TSettingsViewProps } from "../Settings.type";
import { BarStylePicker } from "./BarStylePicker";
import { SettingsGroup } from "./SettingsGroup";
import { SettingsRow } from "./SettingsRow";

export function BehaviourSettings({ page }: TSettingsViewProps) {
  const t = useTranslations();
  const { settings, onSettingChange } = page;

  return (
    <SettingsGroup
      id={SETTINGS_SECTION_IDS.CHARTS_AND_FILTERS}
      title={t("settings.sections.chartsAndFilters")}
    >
      {BEHAVIOUR_SETTINGS.map(({ key, labelKey, descriptionKey }) => (
        <SettingsRow key={key}>
          <ToggleSwitch
            label={t(labelKey)}
            description={t(descriptionKey)}
            checked={settings[key]}
            onChange={() => onSettingChange(key, !settings[key])}
          />
        </SettingsRow>
      ))}
      <SettingsRow
        labelId={SETTINGS_ROW_IDS.BAR_STYLE}
        label={t("settings.chartBarStyle")}
        description={t("settings.descriptions.chartBarStyle")}
        descriptionId={SETTINGS_DESCRIPTION_IDS.BAR_STYLE}
        placement={ESettingsControlPlacement.BELOW}
      >
        <BarStylePicker
          labelId={SETTINGS_ROW_IDS.BAR_STYLE}
          describedById={SETTINGS_DESCRIPTION_IDS.BAR_STYLE}
          value={settings.chartBarStyle}
          onChange={(barStyle) => onSettingChange("chartBarStyle", barStyle)}
        />
      </SettingsRow>
    </SettingsGroup>
  );
}
