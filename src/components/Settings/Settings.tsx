"use client";

import { SegmentedControl } from "@/components/SegmentedControl";
import { FlashBorderIcon, FlashGlowIcon } from "@/components/svg";
import { CollapsibleSection } from "@/components/UI/CollapsibleSection";
import { ToggleSwitch } from "@/components/UI/ToggleSwitch";
import { EUpdateFlashVariant } from "@/enums";
import { useMotionPreference } from "@/hooks/ui/useMotionPreference";
import { useSettingsStore } from "@/stores";
import { useTranslations } from "next-intl";
import { MOTION_SETTINGS_CLASSES as C } from "./Settings.constant";

/**
 * The app's preferences — auto-scroll, city sync, auto-apply, motion — in the sidebar (lg and
 * up) and the burger menu (below lg).
 */
export function Settings() {
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
      <MotionSettings />
    </CollapsibleSection>
  );
}

/** Animations on / off and, while on, the update highlight; reduced motion always wins. */
function MotionSettings() {
  const t = useTranslations();
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled);
  const toggleAnimations = useSettingsStore((state) => state.toggleAnimations);
  const updateFlashVariant = useSettingsStore((state) => state.updateFlashVariant);
  const setUpdateFlashVariant = useSettingsStore((state) => state.setUpdateFlashVariant);
  const { isReducedMotion } = useMotionPreference();

  return (
    <div className={C.ROOT} data-animation-settings>
      <ToggleSwitch
        label={t("sidebar.animations")}
        checked={animationsEnabled}
        onChange={toggleAnimations}
      />
      {isReducedMotion && <p className={C.NOTICE}>{t("sidebar.reducedMotionNotice")}</p>}
      {animationsEnabled && (
        <div className={C.ROW}>
          <span className={C.LABEL}>{t("sidebar.updateHighlight")}</span>
          <SegmentedControl
            label={t("sidebar.updateHighlight")}
            options={[
              {
                value: EUpdateFlashVariant.GLOW,
                label: t("sidebar.updateHighlightGlow"),
                icon: <FlashGlowIcon />,
              },
              {
                value: EUpdateFlashVariant.BORDER,
                label: t("sidebar.updateHighlightBorder"),
                icon: <FlashBorderIcon />,
              },
            ]}
            value={updateFlashVariant}
            onChange={setUpdateFlashVariant}
          />
        </div>
      )}
    </div>
  );
}
