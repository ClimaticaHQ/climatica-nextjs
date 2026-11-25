import { INDICATORS_FIGURE, WALTER_LIETH_FIGURE } from "@/components/info/figures/figures.constant";
import { LOCAL_STORAGE_KEYS, SETTINGS_STORE_VERSION } from "@/constants";
import { EFigureAnchor, EStatsBarItem, ETextSize } from "@/enums";
import { expect, test, type Locator, type Page } from "@playwright/test";

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
// * px: subpixel rounding between an annotation and the axis it is checked against
const TOLERANCE_PX = 2;
const STATS_LABELS: Record<string, string> = {
  [EStatsBarItem.ARID_MONTHS]: "Arid months",
  [EStatsBarItem.MARTONNE]: "Martonne (M)",
};

const FIGURES = [
  { route: "/about/guide", section: "#walter-lieth", annotations: WALTER_LIETH_FIGURE.ANNOTATIONS },
  { route: "/about/data", section: "#indicators", annotations: INDICATORS_FIGURE.ANNOTATIONS },
];

type TBox = { left: number; right: number; top: number; bottom: number };

async function openFigure(page: Page, route: string, section: string) {
  await page.goto(route);
  const figure = page.locator(`${section} figure`).first();
  await figure.scrollIntoViewIfNeeded();
  const visual = figure.locator("> div").first().locator("> div[aria-hidden=true]");
  await expect(visual.locator("svg.recharts-surface")).toBeVisible();
  // * measure once the page holds still: the Contents bar's label can wrap as the scroll spy moves
  let previous = "";
  await expect
    .poll(
      async () => {
        const current = JSON.stringify(await visual.boundingBox());
        const isStill = current === previous;
        previous = current;
        return isStill;
      },
      { intervals: [300] },
    )
    .toBe(true);
  return visual;
}

const boxOf = (locator: Locator) =>
  locator.evaluate((element): TBox => {
    const { left, right, top, bottom } = element.getBoundingClientRect();
    return { left, right, top, bottom };
  });

async function readMonthAxis(visual: Locator) {
  const centres = await visual
    .locator(".recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value")
    .evaluateAll((labels) =>
      labels.map((label) => {
        const box = label.getBoundingClientRect();
        return box.left + box.width / 2;
      }),
    );
  return { centres, width: (centres[1] ?? 0) - (centres[0] ?? 0) };
}

async function readTemperatureAxis(visual: Locator) {
  const ticks = await visual
    .locator(".recharts-yAxis-tick-labels")
    .first()
    .locator(".recharts-cartesian-axis-tick-value")
    .evaluateAll((labels) =>
      labels.map((label) => {
        const box = label.getBoundingClientRect();
        return {
          value: Number((label.textContent ?? "").replace("−", "-")),
          y: box.top + box.height / 2,
        };
      }),
    );
  const [a, b] = [ticks[0], ticks.at(-1)];
  if (a === undefined || b === undefined) throw new Error("no °C ticks");
  return (value: number) => a.y + ((value - a.value) * (b.y - a.y)) / (b.value - a.value);
}

const leaderEnd = (leader: Locator) =>
  leader.locator("line").evaluate((line) => {
    if (!(line instanceof SVGLineElement)) return { x: 0, y: 0 };
    const point = new DOMPoint(line.x2.baseVal.value, line.y2.baseVal.value).matrixTransform(
      line.getScreenCTM() ?? undefined,
    );
    return { x: point.x, y: point.y };
  });

for (const width of [360, 1440])
  for (const textSize of Object.values(ETextSize)) {
    test.describe(`Info figures at ${width}px, ${textSize} text`, () => {
      test.use({ viewport: { width, height: 900 } });
      test.beforeEach(async ({ page }) => {
        await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
          key: LOCAL_STORAGE_KEYS.SETTINGS,
          value: JSON.stringify({ state: { textSize }, version: SETTINGS_STORE_VERSION }),
        });
      });

      for (const { route, section, annotations } of FIGURES) {
        test(`${route}: from its fixture, static, annotations in place`, async ({ page }) => {
          const apiCalls: string[] = [];
          page.on("request", (request) => {
            if (new URL(request.url()).pathname.startsWith("/api/")) apiCalls.push(request.url());
          });
          const visual = await openFigure(page, route, section);
          expect(apiCalls).toEqual([]);
          await expect(visual.locator(FOCUSABLE)).toHaveCount(0);

          const chart = await boxOf(visual.locator("svg.recharts-surface").first());
          const numbers = await visual.locator("[data-annotation-number]").evaluateAll((groups) =>
            groups.map((group) => {
              const { left, right, top, bottom } = group.getBoundingClientRect();
              return { left, right, top, bottom };
            }),
          );
          expect(numbers.length).toBeGreaterThan(0);
          for (const box of numbers) {
            expect(box.left).toBeGreaterThanOrEqual(chart.left);
            expect(box.right).toBeLessThanOrEqual(chart.right);
            expect(box.top).toBeGreaterThanOrEqual(chart.top);
            expect(box.bottom).toBeLessThanOrEqual(chart.bottom);
          }
          for (const [i, a] of numbers.entries()) {
            for (const b of numbers.slice(i + 1)) {
              const overlaps =
                a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
              expect(overlaps).toBe(false);
            }
          }

          const months = await readMonthAxis(visual);
          expect(months.centres).toHaveLength(12);
          const yOf = await readTemperatureAxis(visual);

          for (const [index, { anchor }] of annotations.entries()) {
            const number = index + 1;
            if (anchor.kind === EFigureAnchor.POINT) {
              const end = await leaderEnd(visual.locator(`[data-annotation-leader="${number}"]`));
              expect(Math.abs(end.x - (months.centres[anchor.month - 1] ?? 0))).toBeLessThanOrEqual(
                TOLERANCE_PX,
              );
              expect(Math.abs(end.y - yOf(anchor.value))).toBeLessThanOrEqual(TOLERANCE_PX);
            } else if (anchor.kind === EFigureAnchor.SPAN) {
              const brackets = visual.locator(`[data-annotation-bracket="${number}"]`);
              const segments = await brackets.evaluateAll((paths) =>
                paths.map((path) => {
                  const { left, right } = path.getBoundingClientRect();
                  return {
                    months: (path.getAttribute("data-months") ?? "").split(",").map(Number),
                    left,
                    right,
                  };
                }),
              );
              expect(
                segments.flatMap(({ months: runMonths }) => runMonths).sort((a, b) => a - b),
              ).toEqual([...anchor.months].sort((a, b) => a - b));
              for (const segment of segments) {
                const first = months.centres[(segment.months[0] ?? 1) - 1] ?? 0;
                const last = months.centres[(segment.months.at(-1) ?? 1) - 1] ?? 0;
                expect(Math.abs(segment.left - (first - months.width / 2))).toBeLessThanOrEqual(
                  TOLERANCE_PX,
                );
                expect(Math.abs(segment.right - (last + months.width / 2))).toBeLessThanOrEqual(
                  TOLERANCE_PX,
                );
              }
              await expect(visual.locator(`[data-annotation-number="${number}"]`)).toHaveCount(1);
            } else {
              const marker = visual.locator(`[data-figure-marker="${number}"]`);
              await expect(marker).toBeVisible();
              const label = STATS_LABELS[anchor.item] ?? "";
              const cell = marker.locator(
                `xpath=ancestor::div[.//span[contains(., "${label}")]][1]`,
              );
              await expect(cell).toContainText(label);
              expect(await cell.locator("[data-figure-marker]").count()).toBe(1);
            }
          }
        });
      }
    });
  }

test.describe("Info figures on a phone", () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test("cause no horizontal overflow", async ({ page }) => {
    for (const { route, section } of FIGURES) {
      await openFigure(page, route, section);
      const overflow = await page.evaluate(() => {
        const main = document.querySelector("main");
        return Math.max(
          document.documentElement.scrollWidth - window.innerWidth,
          main ? main.scrollWidth - main.clientWidth : 0,
        );
      });
      expect(overflow).toBeLessThanOrEqual(0);
    }
  });
});
