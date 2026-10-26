import { WEATHER_MAX_YEAR, WEATHER_MIN_YEAR } from "@/constants";
import { z } from "zod";

export const weatherYearSchema = z
  .number({ error: "validation.year.invalid" })
  .int("validation.year.integer")
  .min(WEATHER_MIN_YEAR, "validation.year.tooSmall")
  .max(WEATHER_MAX_YEAR, "validation.year.tooBig");
