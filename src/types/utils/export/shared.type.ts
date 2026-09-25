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
