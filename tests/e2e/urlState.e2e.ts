import { expect, test, type Page } from "@playwright/test";

const MADRID = { id: "madrid", label: "Madrid", description: "", lat: 40.4168, lng: -3.7038 };
const ROME = { id: "rome", label: "Rome", description: "", lat: 41.9028, lng: 12.4964 };

function persist(page: Page, entries: Record<string, unknown>) {
  return page.addInitScript((values) => {
    Object.entries(values).forEach(([key, value]) =>
      window.localStorage.setItem(key, JSON.stringify(value)),
    );
  }, entries);
}

// * regression: the title kept the persisted city ("Madrid" on a Berlin URL, "Rome" on an Oslo
// * URL) because it was captured before the URL was applied
test.describe("URL state wins over persisted state", () => {
  test.describe.configure({ retries: 0 });

  test("city climate title shows the URL city, not the persisted one", async ({ page }) => {
    await persist(page, { "climatica:lastSelectedCity": MADRID });
    await page.goto("/climate-statistics?city=Berlin&lat=52.52&lng=13.405");

    const chart = page.getByTestId("climate-chart");
    await expect(chart.getByRole("heading", { level: 3 })).toHaveText("Berlin", {
      timeout: 30_000,
    });
    await expect(page).toHaveURL(/city=Berlin/);
  });

  test("compare cities title shows the URL cities, not the persisted ones", async ({ page }) => {
    await persist(page, { "climatica:compareCityB": ROME });
    await page.goto(
      "/compare-cities?cityA=Paris&latA=48.8566&lngA=2.3522&cityB=Oslo&latB=59.9139&lngB=10.7522",
    );

    const title = page.getByRole("heading", { level: 3 }).first();
    await expect(title).toHaveAttribute("title", /Paris .+ Oslo/, { timeout: 30_000 });
    await expect(page.getByText("Rome")).toHaveCount(0);
    await expect(page).toHaveURL(/cityB=Oslo/);
  });
});
