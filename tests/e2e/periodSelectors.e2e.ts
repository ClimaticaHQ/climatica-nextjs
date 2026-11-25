import { expect, test, type Page } from "@playwright/test";

const PERIODS_URL = "/compare-periods?city=Madrid&lat=40.4168&lng=-3.7038";
const sidebar = (page: Page) => page.locator("aside");
const param = (page: Page, name: string) => new URL(page.url()).searchParams.get(name);
const periodB = (scope: ReturnType<Page["locator"]>) =>
  scope.getByRole("button", { name: /^Period B/ });

test.describe("Compare Periods selectors from lg: a sidebar section", () => {
  test("Period B and swap in the sidebar, not on the page; applied by auto-apply", async ({
    page,
  }) => {
    await page.goto(PERIODS_URL);
    await expect(periodB(sidebar(page))).toBeVisible({ timeout: 30_000 });
    // * the page's copy is there too, hidden from lg (display: none): no role answers for it
    await expect(page.locator("main").getByTestId("page-period-b-select")).toBeHidden();
    await expect(periodB(page.locator("main"))).toHaveCount(0);

    await periodB(sidebar(page)).click();
    await page.getByTestId("sidebar-period-b-option-c1981-2010").click();
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
    await periodB(sidebar(page)).click();
    await page.getByTestId("sidebar-period-b-option-c1981-2010").click();
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
  await sidebar.locator("button[aria-expanded]").filter({ hasText: "30 sec" }).click();
  await expect(sidebar.locator('button[data-value="30s"]')).toBeEnabled();
  await expect(sidebar.locator('button[data-value="30s"]')).not.toHaveAttribute(
    "aria-describedby",
    /.+/,
  );
});

test.describe("Compare Periods selectors: both copies", () => {
  test("the server's HTML has each copy once, and no id twice", async ({ request }) => {
    const html = await (await request.get(PERIODS_URL)).text();
    for (const testId of ["page-period-b-select", "sidebar-period-b-select"]) {
      expect(html.match(new RegExp(`data-testid="${testId}"`, "g"))).toHaveLength(1);
    }
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(([, id]) => id);
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
  });

  test("a period changed in one copy shows in the other after a resize", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(PERIODS_URL);
    await periodB(sidebar(page)).click();
    await page.getByTestId("sidebar-period-b-option-c1981-2010").click();
    await expect(page).toHaveURL(/period2=c1981-2010/);

    await page.setViewportSize({ width: 390, height: 844 });
    const onPage = periodB(page.locator("main"));
    await expect(onPage).toContainText("1981–2010");
    await onPage.click();
    await page.getByTestId("page-period-b-option-c1961-1990").click();
    await expect(page).toHaveURL(/period2=c1961-1990/);

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(periodB(sidebar(page))).toContainText("1961–1990");
  });
});
