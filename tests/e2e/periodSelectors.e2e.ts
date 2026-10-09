import { expect, test, type Page } from "@playwright/test";

const PERIODS_URL = "/compare-periods?city=Madrid&lat=40.4168&lng=-3.7038";
const sidebar = (page: Page) => page.locator("aside");
const param = (page: Page, name: string) => new URL(page.url()).searchParams.get(name);

test.describe("Compare Periods selectors from lg: a sidebar section", () => {
  test("Period B and swap in the sidebar, not on the page; applied by auto-apply", async ({
    page,
  }) => {
    await page.goto(PERIODS_URL);
    await expect(sidebar(page).getByTestId("period-b-select")).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("main").getByTestId("period-b-select")).toHaveCount(0);

    await sidebar(page).getByTestId("period-b-select").click();
    await page.getByTestId("period-b-option-c1981-2010").click();
    // * a draft change: auto-apply (on by default) writes it shortly after
    await expect(page).toHaveURL(/period2=c1981-2010/);
    expect(param(page, "period1")).toBeNull();

    await sidebar(page).getByRole("button", { name: "Swap periods" }).click();
    await expect(page).toHaveURL(/period1=c1981-2010/);
    expect(param(page, "period2")).toBe("c1970-2000");
  });

  test("weather years in the sidebar; a removed year applies and is remembered", async ({
    page,
  }) => {
    await page.goto(`${PERIODS_URL}&dataset=weather&periods=2021,1967,1990,2010`);
    await expect(sidebar(page).getByRole("button", { name: "Add period" })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator("main").getByRole("button", { name: "Add period" })).toHaveCount(0);

    await sidebar(page).getByRole("button", { name: "Remove 1990" }).click();
    await expect(page).toHaveURL(/periods=2021%2C1967%2C2010(&|$)/);

    // * the last-page-params store keeps them, whichever placement changed them
    await page.locator("header nav").getByRole("link", { name: "City Climate" }).click();
    await expect(page).toHaveURL(/\/climate-statistics/);
    await page.locator("header nav").getByRole("link", { name: "Compare Periods" }).click();
    await expect(page).toHaveURL(/periods=2021%2C1967%2C2010(&|$)/);
  });

  test("with auto-apply off, the Apply button applies them", async ({ page }) => {
    await page.goto(PERIODS_URL);
    await page.evaluate(() =>
      localStorage.setItem(
        "climatica:settings",
        JSON.stringify({ state: { autoApplyFilters: false }, version: 0 }),
      ),
    );
    await page.reload();
    await sidebar(page).getByTestId("period-b-select").click();
    await page.getByTestId("period-b-option-c1981-2010").click();
    await expect(page).not.toHaveURL(/period2=/);
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page).toHaveURL(/period2=c1981-2010/);
  });

  test("at 1024 px too", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto(`${PERIODS_URL}&dataset=weather`);
    await expect(sidebar(page).getByRole("button", { name: "Add period" })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator("main").getByRole("button", { name: "Add period" })).toHaveCount(0);
  });
});

test("the sidebar's Cell Resolution says why 30 s is unavailable — and offers it for 1970–2000", async ({
  page,
}) => {
  await page.goto("/climate-statistics?city=Paris&lat=48.8566&lng=2.3522&dataset=weather");
  const sidebar = page.locator("aside");
  await sidebar.locator("button[aria-expanded]").filter({ hasText: "2.5 min" }).click();
  const option = sidebar.locator('button[data-value="30s"]');
  await expect(option).toBeDisabled();
  await expect(option).toHaveAccessibleDescription("Only for Climate 1970–2000");

  await page.goto("/climate-statistics?city=Paris&lat=48.8566&lng=2.3522");
  await sidebar.locator("button[aria-expanded]").filter({ hasText: "2.5 min" }).click();
  await expect(sidebar.locator('button[data-value="30s"]')).toBeEnabled();
  await expect(sidebar.locator('button[data-value="30s"]')).not.toHaveAttribute(
    "aria-describedby",
    /.+/,
  );
});
