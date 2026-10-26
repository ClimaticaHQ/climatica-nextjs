import { expect, test } from "@playwright/test";

const LANGUAGE_COOKIE = "NEXT_LOCALE";

/** Picks a language on the settings page. */
async function chooseLanguage(page: import("@playwright/test").Page, code: string) {
  await page.getByTestId("language-switcher").click();
  await page.getByTestId(`language-option-${code}`).click();
}

test.describe("Internationalisation", () => {
  test("defaults to English with the City Climate heading", async ({ page }) => {
    await page.goto("/climate-statistics");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("City Climate");
  });

  test("opens in the browser's language without a saved choice", async ({ browser }) => {
    const context = await browser.newContext({ locale: "uk-UA" });
    const page = await context.newPage();
    await page.goto("/climate-statistics");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Клімат міста");
    await context.close();
  });

  test("switching language stays on settings, and every page and reload keep it", async ({
    page,
    context,
  }) => {
    await page.goto("/settings");
    await chooseLanguage(page, "es");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ajustes");
    await expect(page).toHaveURL(/\/settings$/);

    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ajustes");
    const cookie = (await context.cookies()).find(({ name }) => name === LANGUAGE_COOKIE);
    expect(cookie?.value).toBe("es");

    await page.goto("/compare-cities");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Comparar Ciudades");
    expect(new URL(page.url()).pathname).toBe("/compare-cities");
  });

  test("an old link with a language prefix opens without it, in my language", async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([{ name: LANGUAGE_COOKIE, value: "en", url: baseURL ?? "" }]);
    await page.goto("/ro/compare-cities?cityA=Paris&latA=48.8566&lngA=2.3522");

    await expect(page).toHaveURL(/^[^?]*\/compare-cities\?cityA=Paris&latA=48\.8566&lngA=2\.3522/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compare Cities");
    const cookie = (await context.cookies()).find(({ name }) => name === LANGUAGE_COOKIE);
    expect(cookie?.value).toBe("en");
  });
});
