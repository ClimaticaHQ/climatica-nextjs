"use client";

import { SegmentedControl } from "@/components/SegmentedControl";
import { FlashBorderIcon, FlashGlowIcon } from "@/components/svg";
import { ToggleSwitch } from "@/components/UI";
import { EUpdateFlashVariant } from "@/enums";
import { useMotionPreference } from "@/hooks";
import { useSettingsStore } from "@/stores";
import { useTranslations } from "next-intl";
import { ANIMATION_SETTINGS_CLASSES as C } from "./AnimationSettings.constant";

/**
 * The sidebar's motion settings: Animations on / off and, while on, the update highlight
 * (Glow / Border). Notes when the device asks for reduced motion, which always wins.
 */
export function AnimationSettings() {
  const t = useTranslations();
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled);
  const toggleAnimations = useSettingsStore((state) => state.toggleAnimations);
  const updateFlashVariant = useSettingsStore((state) => state.updateFlashVariant);
  const setUpdateFlashVariant = useSettingsStore((state) => state.setUpdateFlashVariant);
  const { isReducedMotion } = useMotionPreference();

  const options = [
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
  ];

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
            options={options}
            value={updateFlashVariant}
            onChange={setUpdateFlashVariant}
          />
        </div>
      )}
    </div>
  );
}
