import { TEXT_SIZE_SCALES } from "@/constants";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const TYPOGRAPHY_FILE = "src/styles/typography.css";
const REM_PX = 16;
const MIN_TEXT_PX = 11;
const SMALLEST_SCALE = Math.min(...Object.values(TEXT_SIZE_SCALES));
const FONT_TOKEN = /--font-[\w-]+:\s*([^;]+);/g;
const REM = /^([\d.]+)rem$/;
const FLOORED = /^max\(([\d.]+)rem,\s*([\d.]+)px\)$/;
// * a class's rem font size, alone or with a px floor: text-[0.625rem], text-[length:max(0.625rem,10px)]
const CLASS_REM = /text-\[(?:length:)?(?:max\()?([\d.]+)rem(?:,([\d.]+)px\))?\]/g;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory()
      ? sourceFiles(path)
      : /\.(ts|tsx)$/.test(path)
        ? [path]
        : [];
  });
}

describe("typography at the smallest text size", () => {
  const tokens = [...readFileSync(TYPOGRAPHY_FILE, "utf8").matchAll(FONT_TOKEN)].map(
    ([, value = ""]) => value.trim(),
  );

  it("keeps every size token at 11px or more", () => {
    const sizes = tokens.filter((value) => REM.test(value) || FLOORED.test(value));
    expect(sizes.length).toBeGreaterThan(10);
    for (const value of sizes) {
      const floored = FLOORED.exec(value);
      const rem = Number((floored ?? REM.exec(value))?.[1]);
      const floor = Number(floored?.[2] ?? 0);
      expect(Math.max(rem * REM_PX * SMALLEST_SCALE, floor), value).toBeGreaterThanOrEqual(
        MIN_TEXT_PX,
      );
      // * a floor never changes the default size
      expect(rem * REM_PX, value).toBeGreaterThanOrEqual(floor);
    }
  });

  it("floors the smallest tokens at 11px", () => {
    expect(tokens).toContain("max(0.6875rem, 11px)");
    expect(tokens).toContain("max(0.75rem, 11px)");
  });

  it("gives every plain rem size under 0.75rem a px floor at its default size", () => {
    for (const file of sourceFiles("src")) {
      for (const [match, rem = "", floor] of readFileSync(file, "utf8").matchAll(CLASS_REM)) {
        if (Number(rem) >= 0.75) continue;
        expect(floor, `${file}: ${match}`).toBeDefined();
        expect(Number(floor), `${file}: ${match}`).toBe(Number(rem) * REM_PX);
      }
    }
  });
});
