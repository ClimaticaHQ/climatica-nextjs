import { describe, expect, it } from "vitest";
import { parseCoordinates } from "@/app/api/@utils";

describe("parseCoordinates", () => {
  it.each([
    ["40.41,-3.70", { lat: 40.41, lng: -3.7 }],
    ["40.41, -3.70", { lat: 40.41, lng: -3.7 }],
    ["40.41 -3.70", { lat: 40.41, lng: -3.7 }],
    ["  40.41   -3.70  ", { lat: 40.41, lng: -3.7 }],
    ["-33 151", { lat: -33, lng: 151 }],
  ])("parses %j", (input, expected) => {
    expect(parseCoordinates(input)).toEqual(expected);
  });

  it.each(["Madrid", "40.41", "40.41;-3.70", "40.41,-3.70,5", "lat 40 lng -3"])(
    "rejects %j",
    (input) => {
      expect(parseCoordinates(input)).toBeNull();
    },
  );
});
