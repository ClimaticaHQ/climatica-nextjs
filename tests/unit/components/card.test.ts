import {
  CARD_BACKGROUND_CLASSES,
  CARD_CLIP_CLASS,
  CARD_ELEVATION_CLASSES,
  CARD_FLAT_BELOW_SM_CLASS,
  CARD_FRAME_CLASS,
  CARD_PADDING_CLASSES,
  CARD_SIZE_CLASSES,
} from "@/components/Card/Card.constant";
import { getCardClassName } from "@/components/Card/Card.util";
import { ECardBackground, ECardElevation, ECardPadding, ECardSize } from "@/enums";
import { describe, expect, it } from "vitest";

const classes = (className: string) => className.split(" ");

describe("Card variants", () => {
  it("defaults to the page-level card: large radius, default padding, flat, page background", () => {
    expect(getCardClassName({})).toBe(
      [
        CARD_FRAME_CLASS,
        CARD_BACKGROUND_CLASSES[ECardBackground.DEFAULT],
        CARD_SIZE_CLASSES[ECardSize.LG],
        CARD_PADDING_CLASSES[ECardPadding.DEFAULT],
      ].join(" "),
    );
  });

  it("keeps the three radii of the nesting levels", () => {
    expect(CARD_SIZE_CLASSES).toEqual({
      [ECardSize.LG]: "rounded-[var(--radius-lg)]",
      [ECardSize.MD]: "rounded-[var(--radius-md)]",
      [ECardSize.SM]: "rounded-[var(--radius-sm)]",
    });
  });

  it.each(Object.values(ECardSize))("applies the %s radius", (size) => {
    expect(classes(getCardClassName({ size }))).toContain(CARD_SIZE_CLASSES[size]);
  });

  it.each(Object.values(ECardPadding).filter((p) => p !== ECardPadding.NONE))(
    "applies the %s padding",
    (padding) => {
      expect(getCardClassName({ padding })).toContain(CARD_PADDING_CLASSES[padding]);
    },
  );

  it("adds no padding for NONE", () => {
    const className = getCardClassName({ padding: ECardPadding.NONE });
    Object.values(CARD_PADDING_CLASSES)
      .filter(Boolean)
      .forEach((padding) => expect(className).not.toContain(padding));
  });

  it("raises only the RAISED elevation", () => {
    const shadow = CARD_ELEVATION_CLASSES[ECardElevation.RAISED];
    expect(classes(getCardClassName({ elevation: ECardElevation.RAISED }))).toContain(shadow);
    expect(classes(getCardClassName({ elevation: ECardElevation.FLAT }))).not.toContain(shadow);
  });

  it("uses the muted background for placeholders", () => {
    expect(classes(getCardClassName({ background: ECardBackground.MUTED }))).toContain(
      CARD_BACKGROUND_CLASSES[ECardBackground.MUTED],
    );
  });

  it("clips and goes flat below sm only when asked", () => {
    expect(classes(getCardClassName({}))).not.toContain(CARD_CLIP_CLASS);
    expect(getCardClassName({})).not.toContain(CARD_FLAT_BELOW_SM_CLASS);
    expect(classes(getCardClassName({ shouldClip: true }))).toContain(CARD_CLIP_CLASS);
    expect(getCardClassName({ isFlatBelowSm: true })).toContain(CARD_FLAT_BELOW_SM_CLASS);
  });

  it("puts the caller's layout classes last", () => {
    expect(getCardClassName({ className: "relative w-full" }).endsWith(" relative w-full")).toBe(
      true,
    );
  });
});
