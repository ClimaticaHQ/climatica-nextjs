import { devices, expect, test, type Page } from "@playwright/test";

const CITY_URL = "/climate-statistics?city=Paris&lat=48.8566&lng=2.3522";
const COMPARE_URL =
  "/compare-cities?cityA=Paris&latA=48.8566&lngA=2.3522&cityB=Oslo&latB=59.9139&lngB=10.7522&layout=overlay&chart=standard&dataset=weather";

const settingsHeading = (page: Page) => page.getByRole("heading", { level: 1, name: "Settings" });

test.describe("Settings page", () => {
  test("the gear opens it, marked as the current page; no filters there", async ({ page }) => {
    await page.goto(CITY_URL);
    const gear = page.getByRole("link", { name: "Settings" });
    await gear.click();

    await expect(settingsHeading(page)).toBeVisible();
    await expect(page).toHaveURL(/\/settings(\?|$)/);
    await expect(gear).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("complementary", { name: "Filters" })).toHaveCount(0);
    await expect(page.getByText("Language, appearance and how the app behaves")).toBeVisible();
  });

  test("Back returns to the previous page with its exact state", async ({ page }) => {
    await page.goto(COMPARE_URL);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compare Cities");
    const before = page.url();

    await page.getByRole("link", { name: "Settings" }).click();
    await expect(settingsHeading(page)).toBeVisible();
    // * the shared filters ride along, so the navbar's links from settings keep them
    expect(new URL(page.url()).searchParams.get("dataset")).toBe("weather");

    await page.goBack();
    await expect(page).toHaveURL(before);
    const chart = page.getByTestId("climate-chart");
    await expect(chart.getByRole("button", { name: "Overlay", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
      { timeout: 30_000 },
    );
  });

  test("a dark theme survives a reload — set before any script of the app runs", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/settings");
    await page.getByRole("button", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    // * no app bundle at all: only the inline head script can have set the class — so the
    // * first paint is already dark, never a light flash
    await page.route("**/_next/static/**/*.js", (route) => route.abort());
    await page.goto(CITY_URL, { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  });

  test("system follows the device, and changes with it", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/settings");
    await expect(page.getByRole("button", { name: "System" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  });

  test("animations off applies on a chart page", async ({ page }) => {
    await page.goto("/settings");
    await page.getByText("Animations", { exact: true }).click();

    await page.goto(CITY_URL);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  });

  test("auto-apply off: a filter waits for Apply on a chart page", async ({ page }) => {
    await page.goto("/settings");
    await page.getByText("Auto-apply filters", { exact: true }).click();

    await page.goto(CITY_URL);
    const sidebar = page.locator("aside");
    await sidebar.getByRole("button", { name: "Weather", exact: true }).click();
    await page.waitForTimeout(1500);
    expect(new URL(page.url()).searchParams.get("dataset")).toBeNull();

    await sidebar.getByRole("button", { name: "Apply filters" }).click();
    await expect(page).toHaveURL(/dataset=weather/);
  });
});

test.describe("Settings page on a phone", () => {
  test.use({ viewport: devices["Pixel 7"].viewport });

  test("the menu's Settings item opens it; no theme button in the top bar", async ({ page }) => {
    await page.goto(CITY_URL);
    await expect(page.getByRole("button", { name: "Toggle theme" })).toHaveCount(0);

    await page.getByRole("button", { name: "Toggle menu" }).click();
    await page.getByRole("link", { name: "Settings" }).click();

    await expect(settingsHeading(page)).toBeVisible();
    await expect(page.getByTestId("language-switcher")).toBeVisible();
  });
});
