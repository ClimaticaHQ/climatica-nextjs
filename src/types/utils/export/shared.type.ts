export type TExportChartColors = {
  text: string;
  textSecondary: string;
  border: string;
  bg: string;
  tmax: string;
  tmin: string;
  tavg: string;
  arid: string;
  humid: string;
  /** Only the heat-map export's selection outline uses this. */
  primary: string;
  /** Walter-Lieth convention colors — resolved from the same CSS vars the live diagram uses. */
  wlTemp: string;
  wlPrec: string;
  wlHumidHatch: string;
  wlAridHatch: string;
  wlCompressedFill: string;
  /** WL overlay series identity (A green, B orange) */
  wlSeriesA: string;
  wlSeriesB: string;
};

/** Axis placement for buildGridAndAxes — WL panels put °C / mm above the axes. */
export type TGridAxesStyle = {
  tickGap: number;
  /** offset of °C / mm above the plot top */
  unitTitlesAbove: number;
};

export type TUnitTitlesArgs = {
  plotLeft: number;
  plotRight: number;
  chartTop: number;
  colors: TExportChartColors;
  axesStyle: TGridAxesStyle;
};

export type TLinearScale = (value: number) => number;

export type TMonthBand = {
  x: number;
  width: number;
  center: number;
};

export type TSvgToPngParams = {
  svg: string;
  width: number;
  height: number;
  scale?: number;
  filename: string;
};

/** Height is derived from how many lines the footer actually wrapped to. */
export type TSvgExportResult = {
  svg: string;
  height: number;
};

export type TExportPoint = {
  x: number;
  y: number;
};
