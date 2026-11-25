import type { ESettingsControlPlacement } from "@/enums";
import type { TAridityPalette, TBarStyle, TSeriesHatch, TSettings } from "@/types";
import type { ReactNode } from "react";

/** What the settings page's hook gives its view. */
export type TSettingsPage = {
  locale: string;
  isLocaleSwitching: boolean; // the page renders again in the new language
  onLocaleChange: (locale: string) => void;
  settings: TSettings;
  animations: TAnimationsSetting;
  updateHighlight: TDependentSetting;
  textSizeDescription: string;
  analytics: TAnalyticsSetting;
  onSettingChange: <K extends keyof TSettings>(key: K, value: TSettings[K]) => void;
};

export type TAnimationsSetting = {
  isChecked: boolean;
  isDisabled: boolean;
  description: string;
};

export type TAnalyticsSetting = {
  isShown: boolean;
  isChecked: boolean;
  onChange: (isGranted: boolean) => void;
};

export type TDependentSetting = {
  isDisabled: boolean;
  description: string;
};

export type TSettingsViewProps = {
  page: TSettingsPage;
};

export type TSettingsGroupProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export type TSettingsRowProps = {
  labelId?: string | undefined;
  label?: string | undefined;
  description?: string | undefined;
  descriptionId?: string | undefined;
  isDisabled?: boolean | undefined;
  placement?: ESettingsControlPlacement | undefined;
  children: ReactNode;
};

export type TBarStyleOption = {
  value: TBarStyle;
  labelKey: string;
  descriptionKey: string;
};

export type TBarStylePickerProps = {
  labelId: string;
  describedById: string;
  value: TBarStyle;
  onChange: (barStyle: TBarStyle) => void;
};

export type TBarStylePreviewProps = {
  barStyle: TBarStyle;
};

export type TBarStylePreviewBar = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  month: number;
  aridityByMonth: Record<number, boolean>;
  fills: TAridityPalette;
  hatch: TSeriesHatch;
};

export type TBarStylePreviewCurve = {
  variable: string;
  d: string;
  stroke: string;
  dash: string | undefined;
  points: readonly { x: number; y: number }[];
};

export type TBarStylePreview = {
  bars: readonly TBarStylePreviewBar[];
  curves: readonly TBarStylePreviewCurve[];
};
