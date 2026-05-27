import { getCityDescription } from "@/utils/geonames.util";
import { describe, expect, it } from "vitest";

describe("getCityDescription", () => {
  it("PPLC + IT + en → Capital city · Italy", () => {
    expect(getCityDescription("PPLC", "IT", "en")).toBe("Capital city · Italy");
  });

  it("PPLC + IT + uk → Столиця · Італія", () => {
    expect(getCityDescription("PPLC", "IT", "uk")).toBe("Столиця · Італія");
  });

  it("PPLC + IT + es → Capital · Italia", () => {
    expect(getCityDescription("PPLC", "IT", "es")).toBe("Capital · Italia");
  });

  it("PPL + US + en → City · United States", () => {
    expect(getCityDescription("PPL", "US", "en")).toBe("City · United States");
  });

  it("PPL + UA + uk → Місто · Україна", () => {
    expect(getCityDescription("PPL", "UA", "uk")).toBe("Місто · Україна");
  });

  it("unknown feature code + FR + en → only country name", () => {
    expect(getCityDescription("XYZ", "FR", "en")).toBe("France");
  });

  it("unknown country code → returns the code as-is", () => {
    expect(getCityDescription("XYZ", "XX", "en")).toBe("XX");
  });

  it("lang ua normalized to uk → returns Ukrainian translation", () => {
    expect(getCityDescription("PPLC", "IT", "ua")).toBe("Столиця · Італія");
  });
});
