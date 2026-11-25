import { SegmentedControl } from "@/components/SegmentedControl";
import { StepSlider, ToggleSwitch } from "@/components/UI";
import { ESegmentedSize } from "@/enums";
import { useTranslations } from "next-intl";
import {
  SETTINGS_DESCRIPTION_IDS,
  SETTINGS_ROW_IDS,
  SETTINGS_SECTION_IDS,
  TEXT_SIZE_OPTIONS,
  THEME_OPTIONS,
  UPDATE_HIGHLIGHT_OPTIONS,
} from "../Settings.constant";
import type { TSettingsViewProps } from "../Settings.type";
import { SettingsGroup } from "./SettingsGroup";
import { SettingsRow } from "./SettingsRow";

export function AppearanceSettings({ page }: TSettingsViewProps) {
  const t = useTranslations();
  const { settings, animations, updateHighlight, onSettingChange } = page;

  return (
    <SettingsGroup id={SETTINGS_SECTION_IDS.APPEARANCE} title={t("settings.sections.appearance")}>
      <SettingsRow label={t("settings.theme")}>
        <SegmentedControl
          label={t("settings.theme")}
          options={THEME_OPTIONS.map(({ value, labelKey, Icon }) => ({
            value,
            label: t(labelKey),
            icon: <Icon />,
          }))}
          value={settings.theme}
          onChange={(theme) => onSettingChange("theme", theme)}
          isFlat
          size={ESegmentedSize.COMPACT}
        />
      </SettingsRow>
      <SettingsRow
        label={t("settings.textSize")}
        description={page.textSizeDescription}
        descriptionId={SETTINGS_DESCRIPTION_IDS.TEXT_SIZE}
      >
        <StepSlider
          label={t("settings.textSize")}
          steps={TEXT_SIZE_OPTIONS.map(({ value, labelKey }) => ({ value, label: t(labelKey) }))}
          value={settings.textSize}
          onChange={(textSize) => onSettingChange("textSize", textSize)}
          ariaDescribedBy={SETTINGS_DESCRIPTION_IDS.TEXT_SIZE}
        />
      </SettingsRow>
      <SettingsRow>
        <ToggleSwitch
          label={t("settings.animations")}
          description={animations.description}
          checked={animations.isChecked}
          isDisabled={animations.isDisabled}
          onChange={() => onSettingChange("animationsEnabled", !settings.animationsEnabled)}
        />
      </SettingsRow>
      <SettingsRow
        labelId={SETTINGS_ROW_IDS.UPDATE_HIGHLIGHT}
        label={t("settings.updateHighlight")}
        description={updateHighlight.description}
        descriptionId={SETTINGS_DESCRIPTION_IDS.UPDATE_HIGHLIGHT}
        isDisabled={updateHighlight.isDisabled}
      >
        <SegmentedControl
          label={t("settings.updateHighlight")}
          options={UPDATE_HIGHLIGHT_OPTIONS.map(({ value, labelKey, Icon }) => ({
            value,
            label: t(labelKey),
            icon: <Icon />,
          }))}
          value={settings.updateFlashVariant}
          onChange={(variant) => onSettingChange("updateFlashVariant", variant)}
          isDisabled={updateHighlight.isDisabled}
          isFlat
          size={ESegmentedSize.COMPACT}
          ariaDescribedBy={SETTINGS_DESCRIPTION_IDS.UPDATE_HIGHLIGHT}
        />
      </SettingsRow>
    </SettingsGroup>
  );
}
