import { expect, test } from "@playwright/test";

test.describe("Internationalisation", () => {
  test("defaults to English with the Climate Statistics heading", async ({ page }) => {
    await page.goto("/climate-statistics");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Climate Statistics");
  });

  test("switches the UI to Spanish when ES is selected", async ({ page }) => {
    await page.goto("/climate-statistics");
    await page.getByTestId("language-switcher").click();
    await page.getByTestId("language-option-es").click();
    await expect(page).toHaveURL(/\/es\//);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Estadisticas Climaticas");
  });

  test("switches the UI to Ukrainian when UA is selected", async ({ page }) => {
    await page.goto("/climate-statistics");
    await page.getByTestId("language-switcher").click();
    await page.getByTestId("language-option-uk").click();
    await expect(page).toHaveURL(/\/uk\//);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Кліматична статистика");
  });

  test("selected language persists when navigating to another page", async ({ page }) => {
    await page.goto("/climate-statistics");
    await page.getByTestId("language-switcher").click();
    await page.getByTestId("language-option-es").click();
    await expect(page).toHaveURL(/\/es\/climate-statistics/);
    await page.getByRole("link", { name: /Compare Cities|Comparar Ciudades/i }).click();
    await expect(page).toHaveURL(/\/es\/compare-cities/);
  });
});
