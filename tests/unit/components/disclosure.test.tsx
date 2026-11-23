// @vitest-environment jsdom
import { Disclosure } from "@/components/UI";
import { EDisclosureSize } from "@/enums";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  // * the fold reads the motion preference; jsdom has no matchMedia
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(cleanup);

const summaryOf = (text: string) => screen.getByText(text).closest("summary");

describe("Disclosure", () => {
  it("is medium by default: the app's text, medium weight, the icon's own size", () => {
    render(<Disclosure summary="Why?">Because.</Disclosure>);
    const summary = summaryOf("Why?");
    expect(summary?.getAttribute("data-disclosure-size")).toBe(EDisclosureSize.MD);
    expect(summary?.className).toContain("font-medium");
    expect(summary?.className).not.toContain("text-[length:");
    expect(summary?.querySelector("span")?.className).not.toContain("[&_svg]:size-4");
  });

  it("is large as a heading for its answer: semibold, 18px from lg, a larger chevron", () => {
    render(
      <Disclosure summary="Why?" size={EDisclosureSize.LG}>
        Because.
      </Disclosure>,
    );
    const summary = summaryOf("Why?");
    expect(summary?.className).toContain("font-semibold");
    expect(summary?.className).not.toContain("font-medium");
    expect(summary?.className).toContain("lg:text-[length:var(--font-md)]");
    expect(summary?.querySelector("span")?.className).toContain("[&_svg]:size-4");
  });
});
