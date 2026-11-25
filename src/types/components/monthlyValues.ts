export type TMonthlyValuesVariable = "tavg" | "prec";

export type TMonthlyValuesMonth = Partial<Record<TMonthlyValuesVariable, number | null>>;

export type TMonthlyValuesSeries = {
  key: string;
  label: string;
  data: readonly TMonthlyValuesMonth[];
};

export type TMonthlyValuesEntry = {
  key: string;
  text: string;
  color: string;
  srText: string;
};

export type TMonthlyValuesRow = {
  variable: TMonthlyValuesVariable;
  unit: string;
  unitColor: string;
  name: string;
  cells: TMonthlyValuesEntry[][];
};

/** temperature red, precipitation blue: the Walter-Lieth convention */
export type TMonthlyValuesPalette = Record<"temp" | "prec" | "text", string>;

export type TMonthlyValuesRowsArgs = {
  series: readonly TMonthlyValuesSeries[];
  palette: TMonthlyValuesPalette;
  names: Record<TMonthlyValuesVariable, string>;
  locale: string;
};

export type TFormatMonthlyValuesValueArgs = {
  variable: TMonthlyValuesVariable;
  value: number | null | undefined;
  locale: string;
};
