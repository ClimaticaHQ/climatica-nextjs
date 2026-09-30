/** The two variables every monthly values table shows, whatever the chart type or chips. */
export type TMonthlyValuesVariable = "tavg" | "prec";

/** One month of a series: its mean temperature and precipitation (null / absent = missing). */
export type TMonthlyValuesMonth = Partial<Record<TMonthlyValuesVariable, number | null>>;

/** A series under a chart: its name, its text color (one series: the text color), its months. */
export type TMonthlyValuesSeries = {
  key: string;
  label: string;
  color: string;
  data: readonly TMonthlyValuesMonth[];
};

/** One series' value in a cell — overlay cells stack A's above B's. */
export type TMonthlyValuesEntry = {
  text: string;
  color: string;
  /** "Madrid: 4.0" — what a screen reader hears for this value */
  srText: string;
};

/** A row: its unit ("°C" red, "mm" blue) and, per month, one entry per series. */
export type TMonthlyValuesRow = {
  variable: TMonthlyValuesVariable;
  unit: string;
  unitColor: string;
  /** the variable's full name, for screen readers ("Mean temperature") */
  name: string;
  cells: TMonthlyValuesEntry[][];
};

/** The unit labels' colors: temperature red, precipitation blue (WL convention). */
export type TMonthlyValuesPalette = Record<"temp" | "prec", string>;

export type TMonthlyValuesRowsArgs = {
  series: readonly TMonthlyValuesSeries[];
  palette: TMonthlyValuesPalette;
  names: Record<TMonthlyValuesVariable, string>;
  /** the UI's locale — the values' decimal separator */
  locale: string;
};

export type TFormatMonthlyValuesValueArgs = {
  variable: TMonthlyValuesVariable;
  value: number | null | undefined;
  locale: string;
};

/** A monthly values table's column geometry under a plot of the same width. */
export type TMonthlyValuesColumnsArgs = {
  tableWidth: number;
  /** one panel of a split pair: the plot's compact margins */
  isCompact: boolean;
};
