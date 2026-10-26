import { expect, test, type Page } from "@playwright/test";

// * five years, added out of order
const URL =
  "/compare-periods?city=Madrid&lat=40.4168&lng=-3.7038&dataset=weather&periods=2021,1967,1999,2000,1987&layout=overlay&chart=standard";
const ASCENDING = ["1967", "1987", "1999", "2000", "2021"];

const chipYears = (page: Page) =>
  page
    .locator("[data-toolbar-chips] button")
    .evaluateAll((chips) => chips.map((chip) => chip.textContent?.trim() ?? ""));
// * the stats table's series columns, each with its marker shape
const columns = (page: Page) =>
  page.locator('[data-chart-block="statsTable"] thead th[scope=col]').evaluateAll((cells) =>
    cells.flatMap((cell) => {
      const shape = cell.querySelector("[data-series-shape]")?.getAttribute("data-series-shape");
      return shape ? [{ year: cell.textContent?.trim() ?? "", shape }] : [];
    }),
  );
// * January's bars, left to right: each one's height (every year a different one)
const januaryBars = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll(".recharts-bar")]
      .map((layer) => layer.querySelector(".recharts-bar-rectangle rect:not([data-bar-hatch])"))
      .flatMap((rect) =>
        rect
          ? [{ x: Number(rect.getAttribute("x")), height: Number(rect.getAttribute("height")) }]
          : [],
      )
      .sort((a, b) => a.x - b.x)
      .map(({ height }) => Math.round(height)),
  );

test("Compare Periods lists its years oldest first; the toggle flips every list, markers stay", async ({
  page,
}) => {
  await page.goto(URL);
  await expect(page.locator(".recharts-bar")).toHaveCount(5, { timeout: 30_000 });
  await expect.poll(() => chipYears(page)).toEqual(ASCENDING);
  await expect.poll(async () => (await columns(page)).map(({ year }) => year)).toEqual(ASCENDING);
  await expect.poll(async () => (await januaryBars(page)).length).toBe(5);
  const before = await columns(page);
  const barsBefore = await januaryBars(page);
  // * each year's marker from the order it was added in
  expect(Object.fromEntries(before.map(({ year, shape }) => [year, shape]))).toEqual({
    "2021": "circle",
    "1967": "square",
    "1999": "triangle",
    "2000": "diamond",
    "1987": "cross",
  });

  await page.getByRole("button", { name: "Sort by year, ascending" }).click();
  await expect(page.getByRole("button", { name: "Sort by year, descending" })).toBeVisible();
  await expect(page).toHaveURL(/order=desc/);
  const descending = [...ASCENDING].reverse();
  await expect.poll(() => chipYears(page)).toEqual(descending);
  await expect.poll(async () => (await columns(page)).map(({ year }) => year)).toEqual(descending);
  await expect.poll(() => januaryBars(page)).toEqual([...barsBefore].reverse());
  // * the same marker for every year
  expect(Object.fromEntries((await columns(page)).map(({ year, shape }) => [year, shape]))).toEqual(
    Object.fromEntries(before.map(({ year, shape }) => [year, shape])),
  );

  // * a reload keeps the order
  await page.reload();
  await expect.poll(() => chipYears(page), { timeout: 30_000 }).toEqual(descending);
});
