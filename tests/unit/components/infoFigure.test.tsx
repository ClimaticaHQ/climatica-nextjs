// @vitest-environment jsdom
import { InfoFigure } from "@/components/info/figures/InfoFigure";
import messages from "@/i18n/locales/en.json";
import { act, cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const wrap = (node: ReactNode) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {node}
    </NextIntlClientProvider>,
  );

let reportNear: (() => void) | undefined;

// * jsdom has no IntersectionObserver: this one reports "near" when the test says so
class NearObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];
  constructor(callback: IntersectionObserverCallback) {
    reportNear = () =>
      callback(
        [
          {
            isIntersecting: true,
            intersectionRatio: 1,
            boundingClientRect: new DOMRect(),
            intersectionRect: new DOMRect(),
            rootBounds: null,
            target: document.body,
            time: 0,
          },
        ],
        this,
      );
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

beforeEach(() => {
  window.IntersectionObserver = NearObserver;
});
afterEach(cleanup);

const annotations = [
  { key: "humid", captionKey: "chart.wlGuide.humid" },
  { key: "arid", captionKey: "chart.wlGuide.arid" },
  { key: "frost", captionKey: "chart.wlGuide.frost" },
];

describe("InfoFigure", () => {
  it("numbers its caption lines in order, each with its message", () => {
    wrap(<InfoFigure visual={<svg />} annotations={annotations} />);
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.getAttribute("data-figure-item"))).toEqual(["1", "2", "3"]);
    expect(items.map((item) => item.textContent)).toEqual([
      `1${messages.chart.wlGuide.humid}`,
      `2${messages.chart.wlGuide.arid}`,
      `3${messages.chart.wlGuide.frost}`,
    ]);
  });

  it("opens with the figures' source and ends with an unnumbered note", () => {
    const { container } = wrap(
      <InfoFigure visual={<svg />} annotations={annotations} noteKey="chart.wlGuide.veryHumid" />,
    );
    const caption = container.querySelector("figcaption");
    expect(caption?.firstElementChild?.textContent).toBe("Soria, 1970–2000 normal, 2.5 min grid:");
    const note = caption?.lastElementChild;
    expect(note?.tagName).toBe("P");
    expect(note?.textContent).toBe(messages.chart.wlGuide.veryHumid);
    expect(note?.closest("ol")).toBeNull();
  });

  it("hides the picture from screen readers and mounts it only near the viewport", () => {
    const { container } = wrap(
      <InfoFigure visual={<svg data-testid="chart" />} annotations={annotations} />,
    );
    const visual = container.querySelector("figure > div");
    expect(visual?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByTestId("chart")).toBeNull();
    act(() => reportNear?.());
    expect(screen.getByTestId("chart")).toBeTruthy();
  });
});
