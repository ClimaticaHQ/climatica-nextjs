import type { ESettingsControlPlacement } from "@/enums";
import type { TAridityPalette, TBarStyle, TSeriesHatch, TSettings } from "@/types";
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
  /** the text size row's description: the applied step's name */
  textSizeDescription: string;
  onSettingChange: <K extends keyof TSettings>(key: K, value: TSettings[K]) => void;
};

/** The animations switch as shown: the device's reduced motion turns it off and locks it. */
export type TAnimationsSetting = {
  isChecked: boolean;
  isDisabled: boolean;
  /** what it does, or why the device has turned it off */
  description: string;
};

/** A setting that only applies while another one is on. */
export type TDependentSetting = {
  isDisabled: boolean;
  /** what it does, or how to enable it when the reader can */
  description: string;
};

export type TSettingsViewProps = {
  page: TSettingsPage;
};

export type TSettingsGroupProps = {
  /** names the section after its heading */
  id: string;
  title: string;
  children: ReactNode;
};

export type TSettingsRowProps = {
  /** the label's id, naming the control */
  labelId?: string | undefined;
  /** absent: the control labels and describes itself across the row (a switch) */
  label?: string | undefined;
  description?: string | undefined;
  /** the description's id, for the control's aria-describedby */
  descriptionId?: string | undefined;
  /** dims the label; the control is disabled by its own prop */
  isDisabled?: boolean | undefined;
  /** FIT when absent */
  placement?: ESettingsControlPlacement | undefined;
  children: ReactNode;
};

export type TBarStyleOption = {
  value: TBarStyle;
  labelKey: string;
  descriptionKey: string;
};

/** The bar style cards: one radio group, named and described by its row. */
export type TBarStylePickerProps = {
  labelId: string;
  /** the row's description, describing every card */
  describedById: string;
  value: TBarStyle;
  onChange: (barStyle: TBarStyle) => void;
};

export type TBarStylePreviewProps = {
  barStyle: TBarStyle;
};

/** A preview bar, ready for PrecipBarShape. */
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

/** What a bar style's thumbnail draws. */
export type TBarStylePreview = {
  bars: readonly TBarStylePreviewBar[];
  curves: readonly TBarStylePreviewCurve[];
};
