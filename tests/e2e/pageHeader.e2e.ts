import { expect, test } from "@playwright/test";

// * every page's header: its title (the navbar's name for it) and its one-line description
const PAGES = [
  {
    path: "/climate-statistics",
    title: "City Climate",
    description: "Search for a city to explore its climate data",
  },
  {
    path: "/compare-cities",
    title: "Compare Cities",
    description: "Compare the climate of two cities side by side",
  },
  {
    path: "/compare-periods",
    title: "Compare Periods",
    description: "See how a city's climate changes across periods and years",
  },
  {
    path: "/heat-map",
    title: "Region Heatmap",
    description: "Draw an area on the map to see how its climate varies",
  },
];

test.describe("PageHeader on every page", () => {
  for (const { path, title, description } of PAGES) {
    test(`${title}: title and description, the same name as its navbar link`, async ({ page }) => {
      await page.goto(path);
      const header = page.locator("main header").first();
      await expect(header.getByRole("heading", { level: 1 })).toHaveText(title);
      await expect(header.locator("p")).toHaveText(description);
      await expect(page.locator("header nav").getByRole("link", { name: title })).toBeVisible();
      // * no "Auto resolution" line by the header any more — the resolution is the filter's
      await expect(page.getByText(/Auto resolution/)).toHaveCount(0);
    });
  }
});
