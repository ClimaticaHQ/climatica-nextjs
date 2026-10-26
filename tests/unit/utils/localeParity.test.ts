import { LOCALES } from "@/constants";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// * messages aren't typed, so a key missing from one locale would only show up at runtime
const LOCALES_DIR = join(process.cwd(), "src/i18n/locales");
const REFERENCE_LOCALE = "en";
// * the argument names in "{name}" and "{count, plural, …}" — not the words inside plural branches
const PLACEHOLDER_REGEX = /\{\s*([A-Za-z_]\w*)\s*[,}]/g;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** { a: { b: "x" } } → { "a.b": "x" }; a non-string leaf is kept as-is so the test reports it */
function flatten(messages: Record<string, unknown>, prefix = ""): Map<string, unknown> {
  const flat = new Map<string, unknown>();
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isRecord(value)) flatten(value, path).forEach((leaf, leafPath) => flat.set(leafPath, leaf));
    else flat.set(path, value);
  }
  return flat;
}

function placeholders(message: unknown) {
  if (typeof message !== "string") return [];
  return [...new Set([...message.matchAll(PLACEHOLDER_REGEX)].map((match) => match[1]))].sort();
}

function loadLocale(fileName: string) {
  const parsed: unknown = JSON.parse(readFileSync(join(LOCALES_DIR, fileName), "utf8"));
  if (!isRecord(parsed)) throw new Error(`${fileName} is not a JSON object`);
  return flatten(parsed);
}

const files = readdirSync(LOCALES_DIR).filter((file) => file.endsWith(".json"));
const locales = new Map(files.map((file) => [file.replace(/\.json$/, ""), loadLocale(file)]));
const reference = locales.get(REFERENCE_LOCALE) ?? new Map<string, unknown>();
const others = [...locales].filter(([locale]) => locale !== REFERENCE_LOCALE);

describe("locale files", () => {
  it("there is one file per configured locale", () => {
    expect([...locales.keys()].sort()).toEqual([...LOCALES].sort());
    expect(reference.size).toBeGreaterThan(0);
  });

  it("every message is a string", () => {
    const nonStrings = [...locales].flatMap(([locale, messages]) =>
      [...messages]
        .filter(([, value]) => typeof value !== "string")
        .map(([key]) => `${locale}: ${key}`),
    );
    expect(nonStrings).toEqual([]);
  });

  it.each(others)("%s has exactly the keys of en", (_locale, messages) => {
    const missing = [...reference.keys()].filter((key) => !messages.has(key));
    const extra = [...messages.keys()].filter((key) => !reference.has(key));
    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });

  it.each(others)("%s uses the same placeholders as en", (_locale, messages) => {
    const mismatched = [...reference]
      .filter(([key]) => messages.has(key))
      .filter(
        ([key, message]) => placeholders(messages.get(key)).join() !== placeholders(message).join(),
      )
      .map(([key]) => key);
    expect(mismatched).toEqual([]);
  });
});
