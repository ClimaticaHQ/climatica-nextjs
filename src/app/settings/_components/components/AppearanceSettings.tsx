import { SegmentedControl } from "@/components/SegmentedControl";
import { ToggleSwitch } from "@/components/UI";
import { useTranslations } from "next-intl";
import {
  SETTINGS_ROW_IDS,
  SETTINGS_SECTION_IDS,
  THEME_OPTIONS,
  UPDATE_HIGHLIGHT_OPTIONS,
} from "../Settings.constant";
import type { TSettingsViewProps } from "../Settings.type";
import { SettingsDependentRows } from "./SettingsDependentRows";
import { SettingsGroup } from "./SettingsGroup";
import { SettingsRow } from "./SettingsRow";

/** The theme, animations and how an update is highlighted — which needs animations. */
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
        />
      </SettingsRow>
      <SettingsDependentRows
        parent={
          <ToggleSwitch
            label={t("settings.animations")}
            description={animations.description}
            checked={animations.isChecked}
            isDisabled={animations.isDisabled}
            onChange={() => onSettingChange("animationsEnabled", !settings.animationsEnabled)}
          />
        }
      >
        <SettingsRow
          labelId={SETTINGS_ROW_IDS.UPDATE_HIGHLIGHT}
          label={t("settings.updateHighlight")}
          description={t("settings.descriptions.updateHighlight")}
          isDisabled={updateHighlight.isDisabled}
          disabledHint={updateHighlight.disabledHint}
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
          />
        </SettingsRow>
      </SettingsDependentRows>
    </SettingsGroup>
  );
}
