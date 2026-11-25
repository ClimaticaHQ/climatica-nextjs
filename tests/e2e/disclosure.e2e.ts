import { expect, test, type Locator, type Page } from "@playwright/test";

const QUESTIONS_URL = "/about/guide#questions";

const question = (page: Page, index = 0) => page.locator("#questions details").nth(index);
const answerBox = (details: Locator) => details.locator("summary + div");
const runningAnimations = (box: Locator) =>
  box.evaluate((element) => element.getAnimations().length);

test.describe("Disclosure: the FAQ folds open and shut", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("opens and closes with a running height animation, ending in the right state", async ({
    page,
  }) => {
    await page.goto(QUESTIONS_URL);
    const details = question(page);
    const box = answerBox(details);
    await details.locator("summary").click();
    expect(await runningAnimations(box)).toBe(1);
    await expect(details).toHaveJSProperty("open", true);
    await expect.poll(() => runningAnimations(box)).toBe(0);
    await expect(box).toBeVisible();
    await expect(details).toHaveAttribute("data-expanded", "true");

    await details.locator("summary").click();
    expect(await runningAnimations(box)).toBe(1);
    // * still open while it folds: closed once the animation has ended
    await expect(details).toHaveJSProperty("open", true);
    await expect.poll(() => runningAnimations(box)).toBe(0);
    await expect(details).toHaveJSProperty("open", false);
    await expect(details).toHaveAttribute("data-expanded", "false");
  });

  test("a second click mid-way turns the fold back, ending closed", async ({ page }) => {
    await page.goto(QUESTIONS_URL);
    const details = question(page);
    const box = answerBox(details);
    await box.evaluate(async (element) => {
      const summary = element.previousElementSibling;
      if (!(summary instanceof HTMLElement)) return;
      summary.click();
      await new Promise((resolve) => setTimeout(resolve, 80));
      summary.click();
    });
    await expect.poll(() => runningAnimations(box)).toBe(0);
    await expect(details).toHaveJSProperty("open", false);
  });

  test("with reduced motion it toggles at once", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(QUESTIONS_URL);
    const details = question(page);
    await details.locator("summary").click();
    expect(await runningAnimations(answerBox(details))).toBe(0);
    await expect(details).toHaveJSProperty("open", true);
    await details.locator("summary").click();
    await expect(details).toHaveJSProperty("open", false);
  });

  test("opened as find-in-page does (open set on details), it shows its answer", async ({
    page,
  }) => {
    await page.goto(QUESTIONS_URL);
    const details = question(page, 1);
    await details.evaluate((element) => {
      if (element instanceof HTMLDetailsElement) element.open = true;
    });
    await expect(answerBox(details)).toBeVisible();
    await expect(details).toHaveAttribute("data-expanded", "true");
  });
});
