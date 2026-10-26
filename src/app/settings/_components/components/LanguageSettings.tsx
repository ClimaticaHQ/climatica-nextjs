import { Dropdown } from "@/components/UI";
import { LANGUAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { SETTINGS_ROW_IDS, SETTINGS_SECTION_IDS } from "../Settings.constant";
import type { TSettingsViewProps } from "../Settings.type";
import { SettingsGroup } from "./SettingsGroup";
import { SettingsRow } from "./SettingsRow";

/** The interface language — saved as the visitor's, so every page opens in it. */
export function LanguageSettings({ page }: TSettingsViewProps) {
  const t = useTranslations();

  return (
    <SettingsGroup id={SETTINGS_SECTION_IDS.LANGUAGE} title={t("settings.sections.language")}>
      <SettingsRow labelId={SETTINGS_ROW_IDS.LANGUAGE} label={t("settings.appLanguage")}>
        <Dropdown
          data-testid="language-switcher"
          optionTestIdPrefix="language-option"
          ariaLabelledBy={SETTINGS_ROW_IDS.LANGUAGE}
          options={LANGUAGES.map(({ code, label }) => ({ value: code, label }))}
          value={page.locale}
          onChange={page.onLocaleChange}
        />
      </SettingsRow>
    </SettingsGroup>
  );
}
