// @vitest-environment jsdom
import { Badge } from "@/components/UI/Badge";
import { SERIES_MARKER_COLOR } from "@/constants";
import { EBadgeSize } from "@/enums";
import { getMarkerPath } from "@/utils/seriesShape.util";
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

  it("shows an entity's shape only when given one, in graphite", () => {
    const { container, rerender } = render(<Badge tone={TONE}>2001</Badge>);
    expect(container.querySelector("[aria-hidden='true']")).toBeNull();
    rerender(
      <Badge tone={TONE} markerShape="triangle">
        2001
      </Badge>,
    );
    const marker = container.querySelector("[aria-hidden='true']");
    expect(marker?.getAttribute("style")).toContain(`color: ${SERIES_MARKER_COLOR}`);
    expect(marker?.querySelector("path")?.getAttribute("d")).toBe(
      getMarkerPath({ shape: "triangle", cx: 7, cy: 7, size: 9 }),
    );
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
