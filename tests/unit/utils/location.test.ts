import { formatLatLng, getLocationName } from "@/utils/location.util";
import { describe, expect, it } from "vitest";

const place = { lat: 49.8397, lng: -24.0297 };

describe("getLocationName", () => {
  it("uses the label", () => {
    expect(getLocationName({ ...place, label: "Lviv", description: "Ukraine" })).toBe("Lviv");
  });

  it("falls back to the description for an unresolved Wikidata id", () => {
    expect(getLocationName({ ...place, label: "Q36036", description: "Lviv, Ukraine" })).toBe(
      "Lviv, Ukraine",
    );
  });

  it("is never empty: coordinates when there is no label or description", () => {
    for (const label of ["Q36036", "", "  "]) {
      expect(getLocationName({ ...place, label, description: "" })).toBe(
        formatLatLng(place.lat, place.lng),
      );
    }
    expect(formatLatLng(place.lat, place.lng)).toBe("49.8397°N, 24.0297°W");
  });
});
