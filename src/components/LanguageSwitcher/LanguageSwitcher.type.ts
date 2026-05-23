import { LANGUAGE_SWITCHER_VARIANTS } from "@/constants";

export type TLanguageSwitcherVariant =
  (typeof LANGUAGE_SWITCHER_VARIANTS)[keyof typeof LANGUAGE_SWITCHER_VARIANTS];

export type TLanguageSwitcherProps = {
  variant?: TLanguageSwitcherVariant;
};
