// @vitest-environment jsdom
import { YearChips } from "@/components/CompareYears/YearChips";
import messages from "@/i18n/locales/en.json";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
  // * the chip row measures its scroll edges
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(cleanup);

const YEARS = [
  { year: 2021, color: "var(--color-period-0)" },
  { year: 1990, color: "var(--color-period-1)" },
  { year: 1967, color: "var(--color-period-2)" },
];

function renderChips(shown: readonly number[]) {
  const onShownChange = vi.fn();
  const onHighlight = vi.fn();
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <YearChips
        years={YEARS}
        shown={shown}
        onShownChange={onShownChange}
        onHighlight={onHighlight}
      />
    </NextIntlClientProvider>,
  );
  return { onShownChange, onHighlight };
}

describe("YearChips", () => {
  it("toggles a year off and on", () => {
    const { onShownChange } = renderChips([2021, 1990]);
    fireEvent.click(screen.getByRole("button", { name: "1990" }));
    expect(onShownChange).toHaveBeenLastCalledWith([2021]);
    fireEvent.click(screen.getByRole("button", { name: "1967" }));
    expect(onShownChange).toHaveBeenLastCalledWith([2021, 1990, 1967]);
  });

  it("locks the last shown year — announced as disabled, no hint", () => {
    const { onShownChange } = renderChips([1990]);
    const last = screen.getByRole("button", { name: "1990" });
    expect(last.getAttribute("aria-disabled")).toBe("true");
    expect(last.className).toContain("cursor-not-allowed");
    expect(last.hasAttribute("aria-describedby")).toBe(false);
    fireEvent.click(last);
    expect(onShownChange).not.toHaveBeenCalled();
  });

  it("highlights the hovered or focused year", () => {
    const { onHighlight } = renderChips([2021, 1990, 1967]);
    const chip = screen.getByRole("button", { name: "1967" });
    fireEvent.mouseEnter(chip.parentElement ?? chip);
    expect(onHighlight).toHaveBeenLastCalledWith(1967);
    fireEvent.focus(chip);
    fireEvent.blur(chip);
    expect(onHighlight).toHaveBeenLastCalledWith(null);
  });
});
