// @vitest-environment jsdom
import { ARRIVAL_FLASH_ATTRIBUTE } from "@/constants";
import { useArrivalFlash } from "@/hooks/ui/useArrivalFlash";
import { useSettingsStore } from "@/stores";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const animate = vi.fn(() => ({ onfinish: null, oncancel: null }));

beforeEach(() => {
  animate.mockClear();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  // * jsdom has no Web Animations: the flash's animation is what's checked
  Object.defineProperty(HTMLElement.prototype, "animate", { value: animate, configurable: true });
});
afterEach(() => {
  cleanup();
  act(() => useSettingsStore.getState().setSetting("animationsEnabled", true));
});

function Years({ years }: { years: readonly number[] }) {
  const ref = useArrivalFlash<HTMLDivElement>(years.map(String));
  return (
    <div ref={ref}>
      {years.map((year) => (
        <span key={year} {...{ [ARRIVAL_FLASH_ATTRIBUTE]: String(year) }}>
          {year}
        </span>
      ))}
    </div>
  );
}

const flashed = () =>
  animate.mock.contexts.flatMap((element) =>
    element instanceof HTMLElement ? [element.textContent] : [],
  );

describe("an added year flashes where it landed", () => {
  it("never on the first render; once for the year added, not for the ones kept", () => {
    const { rerender } = render(<Years years={[1967, 2021]} />);
    expect(animate).not.toHaveBeenCalled();
    rerender(<Years years={[1967, 1990, 2021]} />);
    expect(flashed()).toEqual(["1990"]);
    // * a reorder adds nothing
    rerender(<Years years={[2021, 1990, 1967]} />);
    expect(flashed()).toEqual(["1990"]);
  });

  it("none with the Animations setting off", () => {
    act(() => useSettingsStore.getState().setSetting("animationsEnabled", false));
    const { rerender } = render(<Years years={[1967]} />);
    rerender(<Years years={[1967, 1990]} />);
    expect(animate).not.toHaveBeenCalled();
  });
});
