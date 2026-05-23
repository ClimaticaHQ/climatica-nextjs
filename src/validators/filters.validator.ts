import { CLIMATE_PERIODS, WEATHER_MAX_YEAR, WEATHER_MIN_YEAR } from "@/constants";
import { z } from "zod";

export const weatherYearSchema = z
  .number({ error: "validation.year.invalid" })
  .int("validation.year.integer")
  .min(WEATHER_MIN_YEAR, "validation.year.tooSmall")
  .max(WEATHER_MAX_YEAR, "validation.year.tooBig");

export const climatePeriodSchema = z.enum(Object.values(CLIMATE_PERIODS) as [string, ...string[]], {
  error: () => "validation.period.invalid",
});

export const sidebarFiltersSchema = z.object({
  dataset: z.enum(["climate", "weather"]),
  climatePeriod: climatePeriodSchema,
  weatherYear: weatherYearSchema,
});

export type TSidebarFiltersSchema = z.infer<typeof sidebarFiltersSchema>;
