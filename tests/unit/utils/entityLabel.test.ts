import { ESeriesKind } from "@/enums";
import { getEntityShortLabels } from "@/utils";
import { describe, expect, it } from "vitest";

const city = (label: string) => ({ kind: ESeriesKind.CITY, label });

describe("getEntityShortLabels", () => {
  it("a weather year stays whole", () => {
    expect(
      getEntityShortLabels([
        { kind: ESeriesKind.WEATHER_YEAR, label: "1967" },
        { kind: ESeriesKind.WEATHER_YEAR, label: "2021" },
      ]),
    ).toEqual(["1967", "2021"]);
  });

  it("a climate period shortens to ’70–’00", () => {
    expect(
      getEntityShortLabels([
        { kind: ESeriesKind.CLIMATE_PERIOD, label: "1970–2000" },
        { kind: ESeriesKind.CLIMATE_PERIOD, label: "1991-2020" },
      ]),
    ).toEqual(["’70–’00", "’91–’20"]);
  });

  it("a city: its first three letters, uppercase", () => {
    expect(getEntityShortLabels([city("Madrid"), city("Rome")])).toEqual(["MAD", "ROM"]);
  });

  it("cities sharing three letters take as many as tell them apart", () => {
    expect(getEntityShortLabels([city("Santiago"), city("Santander")])).toEqual(["SANTI", "SANTA"]);
    expect(getEntityShortLabels([city("Paris"), city("Parma")])).toEqual(["PARI", "PARM"]);
  });

  it("letters only: spaces and punctuation don't count", () => {
    expect(getEntityShortLabels([city("St. Louis"), city("São Paulo")])).toEqual(["STL", "SÃO"]);
  });
});
