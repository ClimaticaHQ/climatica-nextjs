import { cityFromUrl } from "@/utils/urlParams.util";
import { describe, expect, it } from "vitest";

describe("cityFromUrl", () => {
  it("valid lat/lng returns a TWikidataCity with correct fields", () => {
    const city = cityFromUrl("48.8566", "2.3522", "Paris");
    expect(city).not.toBeNull();
    expect(city?.lat).toBe(48.8566);
    expect(city?.lng).toBe(2.3522);
  });

  it("id is formatted as url:lat,lng", () => {
    const city = cityFromUrl("48.8566", "2.3522", "Paris");
    expect(city?.id).toBe("url:48.8566,2.3522");
  });

  it("null lat returns null", () => {
    expect(cityFromUrl(null, "2.3522", "Paris")).toBeNull();
  });

  it("null lng returns null", () => {
    expect(cityFromUrl("48.8566", null, "Paris")).toBeNull();
  });

  it("non-numeric lat string returns null", () => {
    expect(cityFromUrl("abc", "2.3522", "Paris")).toBeNull();
  });

  it("non-numeric lng string returns null", () => {
    expect(cityFromUrl("48.8566", "xyz", "Paris")).toBeNull();
  });

  it("label uses labelRaw when provided", () => {
    const city = cityFromUrl("48.8566", "2.3522", "Paris");
    expect(city?.label).toBe("Paris");
  });

  it("label falls back to lat, lng when labelRaw is null", () => {
    const city = cityFromUrl("48.8566", "2.3522", null);
    expect(city?.label).toBe("48.8566, 2.3522");
  });

  it("description is always empty string", () => {
    const city = cityFromUrl("48.8566", "2.3522", "Paris");
    expect(city?.description).toBe("");
  });
});
