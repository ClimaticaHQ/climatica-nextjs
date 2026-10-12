import type { TSettings } from "@/types";
import type { ReactNode } from "react";

/** What the settings page's hook gives its view. */
export type TSettingsPage = {
  locale: string;
  /** the page renders again in the new language */
  isLocaleSwitching: boolean;
  onLocaleChange: (locale: string) => void;
  settings: TSettings;
  animations: TAnimationsSetting;
  updateHighlight: TDependentSetting;
  onSettingChange: <K extends keyof TSettings>(key: K, value: TSettings[K]) => void;
};

/** The animations switch as shown: the device's reduced motion turns it off and locks it. */
export type TAnimationsSetting = {
  isChecked: boolean;
  isDisabled: boolean;
  description: string;
};

/** A setting that only applies while another one is on. */
export type TDependentSetting = {
  isDisabled: boolean;
  /** why it's disabled and how to enable it; none when the reader can't (the device decides) */
  disabledHint?: string | undefined;
};

export type TSettingsViewProps = {
  page: TSettingsPage;
};

export type TSettingsGroupProps = {
  /** names the group after its heading */
  id: string;
  title: string;
  children: ReactNode;
};

export type TSettingsRowProps = {
  /** the label's id, naming the control */
  labelId?: string | undefined;
  label: string;
  description?: string | undefined;
  /** dims the label; the control is disabled by its own prop */
  isDisabled?: boolean | undefined;
  /** replaces the description while disabled, in the same space — the row never changes height */
  disabledHint?: string | undefined;
  /** the control, on the right */
  children: ReactNode;
};

export type TSettingsDependentRowsProps = {
  /** the setting the others depend on */
  parent: ReactNode;
  /** the settings that apply only while the parent is on */
  children: ReactNode;
};
