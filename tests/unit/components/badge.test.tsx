// @vitest-environment jsdom
import { Badge } from "@/components/UI/Badge";
import { EBadgeSize } from "@/enums";
import { getSeriesTint } from "@/utils/seriesColor.util";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

const TONE = {
  bg: "var(--color-cell-count-fast-bg)",
  border: "var(--color-cell-count-fast-border)",
  text: "var(--color-cell-count-fast-text)",
};

const badgeOf = (text: string) => screen.getByText(text).closest("span[style]");

describe("Badge", () => {
  it("draws its tone: background, 1px border and text", () => {
    render(<Badge tone={TONE}>Fast</Badge>);
    const badge = badgeOf("Fast");
    expect(badge?.className).toContain("border");
    expect(badge?.getAttribute("style")).toContain(
      "background-color: var(--color-cell-count-fast-bg)",
    );
    expect(badge?.getAttribute("style")).toContain(
      "border-color: var(--color-cell-count-fast-border)",
    );
    expect(badge?.getAttribute("style")).toContain("color: var(--color-cell-count-fast-text)");
  });

  it("shows a dot only when given a dot colour", () => {
    const { container, rerender } = render(<Badge tone={TONE}>2001</Badge>);
    expect(container.querySelector("[aria-hidden='true']")).toBeNull();
    rerender(
      <Badge tone={TONE} dotColor="var(--color-series-3)">
        2001
      </Badge>,
    );
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot?.getAttribute("style")).toContain("background-color: var(--color-series-3)");
  });

  it("truncates its content in one line and keeps the full text as its title", () => {
    render(
      <Badge tone={TONE} size={EBadgeSize.SM} isTruncated title="Extremely humid">
        Extremely humid
      </Badge>,
    );
    const content = screen.getByText("Extremely humid");
    expect(content.className).toContain("truncate");
    expect(content.parentElement?.getAttribute("title")).toBe("Extremely humid");
    expect(content.parentElement?.className).toContain("text-[10px]");
  });

  it("is medium by default", () => {
    render(<Badge tone={TONE}>Fast</Badge>);
    expect(badgeOf("Fast")?.className).toContain("text-[length:var(--font-xs)]");
  });
});

describe("getSeriesTint", () => {
  it("gives a listed series its tint set and dot by place, wrapping like its colour", () => {
    expect(getSeriesTint(0)).toEqual({
      bg: "var(--color-series-1-tint-bg)",
      border: "var(--color-series-1-tint-border)",
      text: "var(--color-series-1-tint-text)",
      dot: "var(--color-series-1-tint-dot)",
    });
    expect(getSeriesTint(6).bg).toBe("var(--color-series-2-tint-bg)");
    expect(getSeriesTint(-1).bg).toBe("var(--color-series-1-tint-bg)");
  });
});
