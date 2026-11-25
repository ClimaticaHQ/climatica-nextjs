import { TEXT_SIZE_OPTIONS } from "@/app/settings/_components/Settings.constant";
import type { TSettingsPage } from "@/app/settings/_components/Settings.type";
import { useAnalyticsConsent } from "@/hooks/persisted/useAnalyticsConsent";
import { useMotionPreference } from "@/hooks/ui/useMotionPreference";
import { useLocaleSwitch } from "@/hooks/url/useLocaleSwitch";
import { useSettingsStore } from "@/stores/settingsStore";
import { getPersistedSettings } from "@/utils/settings.util";
import { useLocale, useTranslations } from "next-intl";
import { useDocumentTitle } from "./useDocumentTitle";

/** The settings page: every setting, applied as it changes — no save step. */
export function useSettingsPage(): TSettingsPage {
  const t = useTranslations();
  const locale = useLocale();
  const { switchLocale, isSwitching } = useLocaleSwitch();
  const state = useSettingsStore();
  // * live: the device's reduced motion can change while the page is open
  const { isReducedMotion, isMotionEnabled } = useMotionPreference();
  const consent = useAnalyticsConsent();

  useDocumentTitle({ pageTitle: t("pages.settings.title"), places: [], details: null });

  const textSize = TEXT_SIZE_OPTIONS.find((option) => option.value === state.textSize);

  return {
    locale,
    isLocaleSwitching: isSwitching,
    onLocaleChange: switchLocale,
    settings: getPersistedSettings(state),
    // * the switch shows what applies: off and locked while the device asks for less motion,
    // * the saved choice back as soon as it stops asking
    animations: {
      isChecked: isMotionEnabled,
      isDisabled: isReducedMotion,
      description: t(
        isReducedMotion ? "settings.reducedMotionNotice" : "settings.descriptions.animations",
      ),
    },
    updateHighlight: {
      isDisabled: !isMotionEnabled,
      // * no hint under reduced motion: turning animations on isn't the reader's to do then
      description: t(
        isMotionEnabled || isReducedMotion
          ? "settings.descriptions.updateHighlight"
          : "settings.hints.turnOnAnimations",
      ),
    },
    textSizeDescription: textSize ? t(textSize.labelKey) : "",
    analytics: {
      isShown: consent.isAvailable,
      isChecked: consent.isGranted,
      onChange: consent.setGranted,
    },
    onSettingChange: state.setSetting,
  };
}
