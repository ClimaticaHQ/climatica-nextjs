// @vitest-environment jsdom
import { Chip } from "@/components/UI";
import {
  DISABLED_LOOK,
  DISABLED_SELECTED_LOOK,
  TOGGLE_CHIP_SCALE_CLASSES,
} from "@/components/UI/Chip/Chip.constant";
import { EChipVariant, ETextScale } from "@/enums";
import messages from "@/i18n/locales/en.json";
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

const noop = () => {};
const wrap = (node: ReactNode) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {node}
    </NextIntlClientProvider>,
  );

/** A toggle chip's classes, with its text scale's own set aside: what's left is its state's look. */
function stateClasses({ textScale, isActive }: { textScale: ETextScale; isActive: boolean }) {
  const label = `${textScale}-${isActive}`;
  wrap(<Chip label={label} disabled isActive={isActive} textScale={textScale} onClick={noop} />);
  return screen
    .getByRole("button", { name: label })
    .className.replace(TOGGLE_CHIP_SCALE_CLASSES[textScale], "")
    .trim();
}

describe("Chip disabled look", () => {
  it("is a solid, muted chip: no dashed border, no fade, no hover", () => {
    const look = stateClasses({ textScale: ETextScale.DEFAULT, isActive: false });
    expect(look).toContain(DISABLED_LOOK);
    expect(look).not.toMatch(/border-dashed/);
    expect(look).not.toMatch(/opacity/);
    expect(look).not.toMatch(/hover:/);
  });

  it("is the same whatever the text scale", () => {
    for (const isActive of [false, true]) {
      expect(stateClasses({ textScale: ETextScale.DEFAULT, isActive })).toBe(
        stateClasses({ textScale: ETextScale.TOUCH, isActive }),
      );
    }
  });

  it("keeps a selected chip apart from an unselected one", () => {
    const selected = stateClasses({ textScale: ETextScale.DEFAULT, isActive: true });
    const unselected = stateClasses({ textScale: ETextScale.DEFAULT, isActive: false });
    expect(selected).not.toBe(unselected);
    expect(selected).toContain(DISABLED_SELECTED_LOOK);
  });

  it("still says it's selected while disabled", () => {
    wrap(<Chip label="Max temp" disabled isActive onClick={noop} />);
    const chip = screen.getByRole("button", { name: "Max temp" });
    expect(chip).toHaveProperty("disabled", true);
    expect(chip.getAttribute("aria-pressed")).toBe("true");
  });
});

describe("Chip filter bar pill, not changeable here", () => {
  it("stays an active control with the disabled look", () => {
    wrap(
      <Chip
        variant={EChipVariant.VALUE}
        value="3 variables"
        ariaLabel="Variables: Not available in Walter-Lieth view. Show why"
        isChanged={false}
        isDisabled
        onClick={noop}
      />,
    );
    const pill = screen.getByRole("button", { name: /Show why/ });
    expect(pill.hasAttribute("disabled")).toBe(false);
    expect(pill.hasAttribute("aria-disabled")).toBe(false);
    expect(pill.innerHTML).toContain(DISABLED_LOOK);
  });
});
