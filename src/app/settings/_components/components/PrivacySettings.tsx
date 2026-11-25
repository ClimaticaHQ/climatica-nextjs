import { ToggleSwitch } from "@/components/UI";
import { useTranslations } from "next-intl";
import { SETTINGS_SECTION_IDS } from "../Settings.constant";
import type { TSettingsViewProps } from "../Settings.type";
import { SettingsGroup } from "./SettingsGroup";
import { SettingsRow } from "./SettingsRow";

/** The analytics choice, the same one the consent banner asks for. */
export function PrivacySettings({ page }: TSettingsViewProps) {
  const t = useTranslations();
  const { isChecked, onChange } = page.analytics;

  return (
    <SettingsGroup id={SETTINGS_SECTION_IDS.PRIVACY} title={t("settings.sections.privacy")}>
      <SettingsRow>
        <ToggleSwitch
          label={t("settings.analytics")}
          description={t("settings.descriptions.analytics")}
          checked={isChecked}
          onChange={() => onChange(!isChecked)}
        />
      </SettingsRow>
    </SettingsGroup>
  );
}
