import { expect, test, type Page } from "@playwright/test";

// * City Climate's standard chart: Soria has frost months (Tmin below 0 °C), Seville none
const SORIA_URL = "/climate-statistics?city=Soria&lat=41.7636&lng=-2.4649&chart=standard";
const SEVILLE_URL = "/climate-statistics?city=Seville&lat=37.3891&lng=-5.9845&chart=standard";
const ZERO_LINE = ".chart-zero-line line";
// * px: subpixel rounding between the line and its tick label's centre
const TOLERANCE_PX = 2;

async function openChart(page: Page, url: string) {
  await page.goto(url);
  await expect(page.locator(".recharts-line").first()).toBeVisible({ timeout: 30_000 });
}

test.describe("Standard chart's 0 °C line", () => {
  test("is drawn at the 0 °C tick for a place with frost", async ({ page }) => {
    await openChart(page, SORIA_URL);
    const line = page.locator(ZERO_LINE);
    await expect(line).toHaveCount(1);

    const zeroTick = page
      .locator(".recharts-yAxis-tick-labels")
      .first()
      .locator(".recharts-cartesian-axis-tick-value", { hasText: /^0$/ });
    const tickBox = await zeroTick.boundingBox();
    const lineBox = await line.boundingBox();
    if (tickBox === null || lineBox === null) throw new Error("no 0 °C tick or line");
    expect(
      Math.abs(lineBox.y + lineBox.height / 2 - (tickBox.y + tickBox.height / 2)),
    ).toBeLessThanOrEqual(TOLERANCE_PX);
  });

  test("is absent for a place without frost", async ({ page }) => {
    await openChart(page, SEVILLE_URL);
    await expect(page.locator(ZERO_LINE)).toHaveCount(0);
  });
});
