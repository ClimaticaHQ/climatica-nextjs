// @vitest-environment jsdom
import { VariableChips } from "@/components/charts/VariableChips";
import messages from "@/i18n/locales/en.json";
import type { TVisibleSeries } from "@/types";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

function renderChips(visible: TVisibleSeries, variables?: ("tmax" | "tmin" | "prec")[]) {
  const onChange = vi.fn();
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <VariableChips visible={visible} variables={variables} onChange={onChange} />
    </NextIntlClientProvider>,
  );
  return onChange;
}

const chip = (name: string) => screen.getByRole("button", { name });

describe("VariableChips (chart card)", () => {
  it("locks the last active variable like the sidebar: active, aria-disabled, no hint", () => {
    const onChange = renderChips({ tmax: true, tmin: false, tavg: false, prec: false });
    const last = chip("Max temp");
    expect(last.getAttribute("aria-pressed")).toBe("true");
    expect(last.getAttribute("aria-disabled")).toBe("true");
    expect(last.className).toContain("cursor-not-allowed");
    expect(last.hasAttribute("aria-describedby")).toBe(false);
    fireEvent.click(last);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("toggles the others", () => {
    const onChange = renderChips({ tmax: true, tmin: true, tavg: false, prec: false });
    expect(chip("Max temp").hasAttribute("aria-disabled")).toBe(false);
    fireEvent.click(chip("Max temp"));
    expect(onChange).toHaveBeenLastCalledWith({
      tmax: false,
      tmin: true,
      tavg: false,
      prec: false,
    });
  });

  it("disables a variable the page didn't fetch", () => {
    renderChips({ tmax: true, tmin: true, tavg: false, prec: false }, ["tmax", "tmin"]);
    expect(chip("Precip").hasAttribute("disabled")).toBe(true);
  });
});
