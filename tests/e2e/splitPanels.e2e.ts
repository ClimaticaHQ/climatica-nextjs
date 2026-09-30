import { expect, test } from "@playwright/test";

const COMPARE_CITIES_URL =
  "/compare-cities?cityA=Paris&latA=48.8566&lngA=2.3522&cityB=London&latB=51.5074&lngB=-0.1278";

test.describe("Split panels", () => {
  test.describe.configure({ retries: 0 });

  test("expand A, switch to B, reload, collapse", async ({ page }) => {
    await page.goto(COMPARE_CITIES_URL);
    const expandA = page.getByRole("button", { name: "Expand Paris" });
    await expect(expandA).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: "Expand London" })).toBeVisible();

    await expandA.click();
    const collapse = page.getByRole("button", { name: "Show both" });
    await expect(collapse).toBeFocused();
    await expect(page).toHaveURL(/expanded=a/);
    const panelSwitch = page.getByRole("group", { name: "Expanded panel" });
    await expect(panelSwitch.getByRole("button", { name: "Paris" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await panelSwitch.getByRole("button", { name: "London" }).click();
    await expect(page).toHaveURL(/expanded=b/);
    // * the panel header: name and "{period} · {altitude}" — the comparison table has the stats
    await expect(page.locator("figcaption").filter({ hasText: "London" }).first()).toContainText(
      " m",
    );

    await page.reload();
    await expect(
      page.getByRole("group", { name: "Expanded panel" }).getByRole("button", { name: "London" }),
    ).toHaveAttribute("aria-pressed", "true", { timeout: 30_000 });
    await expect(page.getByRole("button", { name: /^Expand / })).toHaveCount(0);

    await page.getByRole("button", { name: "Show both" }).click();
    await expect(page.getByRole("button", { name: "Expand Paris" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Expand London" })).toBeFocused();
    await expect(page.getByRole("group", { name: "Expanded panel" })).toHaveCount(0);
    await expect(page).not.toHaveURL(/expanded=/);
  });
});
