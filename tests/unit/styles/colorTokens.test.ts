import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// * colour values live in tokens.css only (docs/colors.md); these files can't read CSS, so they
// * hold literals — each must be one of the primitives
const ALLOWLIST: Readonly<Record<string, string>> = {
  "src/app/icon.svg": "the favicon — a static file",
  "src/assets/climatica-logo.svg": "the static logo — a static file",
  "src/constants/og.constant.ts": "the OG image — next/og renders it without CSS",
  "src/app/global-error.tsx": "replaces the root layout when that crashes — no stylesheet",
};
const TOKENS_FILE = "src/styles/tokens.css";
const SCANNED = /\.(ts|tsx|js|mjs|css|svg|html)$/;

const HEX = /(?<![&\w])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;
const COLOR_FUNCTION =
  /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|(?<![\w.])color\(\s*(?:srgb|display-p3|xyz)/g;
const PALETTE =
  "(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)";
const TAILWIND_COLOR_CLASS = new RegExp(
  `\\b(?:bg|text|border(?:-[trblxy])?|outline|ring(?:-offset)?|fill|stroke|from|via|to|divide|decoration|accent|caret|placeholder|shadow)-(?:white|black|${PALETTE}-(?:50|[1-9]00|950))(?:/\\d{1,3})?\\b`,
  "g",
);
const NAMED =
  "(?:white|black|red|green|blue|yellow|orange|purple|pink|gray|grey|silver|navy|teal|steelblue)";
const NAMED_COLOR = new RegExp(
  `(?:\\b(?:color|background(?:-color)?|fill|stroke|border(?:-color)?|stop-color|outline-color)\\s*[:=]\\s*["'\`]?\\s*|\\bsolid\\s+)${NAMED}\\b`,
  "gi",
);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const root = process.cwd();
const files = walk(join(root, "src"))
  .map((path) => relative(root, path))
  .filter((path) => SCANNED.test(path));
const read = (path: string) => readFileSync(join(root, path), "utf8");

function literalsIn(text: string) {
  return [HEX, COLOR_FUNCTION, TAILWIND_COLOR_CLASS, NAMED_COLOR].flatMap((pattern) =>
    [...text.matchAll(pattern)].map((match) => match[0]),
  );
}

// * the tokens file's blocks: the first (:root) holds the primitives, the rest the semantic tokens
const blocks = [...read(TOKENS_FILE).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
  selector: (match[1] ?? "").replace(/\/\*[\s\S]*?\*\//g, "").trim(),
  declarations: [...(match[2] ?? "").matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((d) => ({
    name: d[1] ?? "",
    value: (d[2] ?? "").trim(),
  })),
}));
const [primitiveBlock, ...semanticBlocks] = blocks;
const primitives = new Map((primitiveBlock?.declarations ?? []).map((d) => [d.name, d.value]));

/** "#FFF", "white" → "#ffffff": one spelling per colour, to compare literals with primitives. */
function normalize(color: string) {
  const value = color.trim().toLowerCase();
  if (value === "white") return "#ffffff";
  if (value === "black") return "#000000";
  if (/^#[0-9a-f]{3}$/.test(value)) return `#${[...value.slice(1)].map((c) => c + c).join("")}`;
  return value;
}
const primitiveValues = new Set([...primitives.values()].map(normalize));

// * the scales of the primitives and their steps (docs/colors.md): the brand's M2 tonal palette
// * whole, M2 grey and the M2 swatches as far as they are used
const TONAL_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const SCALES: Readonly<Record<string, readonly number[]>> = {
  green: TONAL_STEPS,
  grey: [50, 200, 300, 500, 900],
  red: [300, 700],
  orange: [300, 800, 900],
  blue: [200, 300, 400, 700, 800, 900],
};

/** Relative luminance of "#rrggbb" — the order of a scale's steps. */
function luminance(hex: string) {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((index) => {
    const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

describe("colours live in tokens.css only", () => {
  it("no file outside tokens.css and the allowlist holds a colour literal", () => {
    const offenders = files
      .filter((path) => path !== TOKENS_FILE && !(path in ALLOWLIST))
      .flatMap((path) => literalsIn(read(path)).map((literal) => `${path}: ${literal}`));
    expect(offenders).toEqual([]);
  });

  it("every colour in an allowlisted file is one of the primitives", () => {
    const strays = Object.keys(ALLOWLIST).flatMap((path) => {
      const text = read(path);
      const colors = [
        ...text.matchAll(HEX),
        ...text.matchAll(new RegExp(`(?<=["':\\s])${NAMED}(?=["'\\s;,)])`, "g")),
      ];
      return colors
        .map((match) => match[0])
        .filter((color) => !primitiveValues.has(normalize(color)))
        .map((color) => `${path}: ${color}`);
    });
    expect(strays).toEqual([]);
  });
});

describe("tokens.css: primitives, then semantic tokens", () => {
  it("opens with the primitives: every one a colour value", () => {
    expect(primitiveBlock?.selector).toBe(":root");
    const notColors = [...primitives].filter(([, value]) => literalsIn(value).length === 0);
    expect(notColors).toEqual([]);
  });

  it("primitives are written in one format: #rrggbb", () => {
    const otherFormats = [...primitives].filter(([, value]) => !/^#[0-9a-f]{6}$/.test(value));
    expect(otherFormats).toEqual([]);
  });

  it("each scale has every step, each darker than the one before", () => {
    const problems = Object.entries(SCALES).flatMap(([scale, steps]) => {
      const tones = steps.map((step) => primitives.get(`--${scale}-${step}`));
      const missing = steps
        .filter((_, index) => !tones[index])
        .map((step) => `--${scale}-${step} missing`);
      const unordered = tones
        .slice(1)
        .filter((tone, index) => {
          const previous = tones[index];
          return tone && previous && luminance(tone) >= luminance(previous);
        })
        .map((tone) => `--${scale}: ${tone} not darker than the step before`);
      return [...missing, ...unordered];
    });
    expect(problems).toEqual([]);
  });

  it("semantic tokens hold no colour value: each colour token points to primitives", () => {
    const literals = semanticBlocks.flatMap(({ selector, declarations }) =>
      declarations
        .filter(({ value }) => literalsIn(value).length > 0)
        .map(({ name, value }) => `${selector} ${name}: ${value}`),
    );
    const notPrimitives = semanticBlocks.flatMap(({ selector, declarations }) =>
      declarations
        .filter(({ name }) => name.startsWith("--color-"))
        .flatMap(({ name, value }) =>
          [...value.matchAll(/var\((--[\w-]+)\)/g)]
            .map((match) => match[1] ?? "")
            .filter((ref) => !primitives.has(ref))
            .map((ref) => `${selector} ${name} → ${ref}`),
        ),
    );
    expect(literals).toEqual([]);
    expect(notPrimitives).toEqual([]);
  });

  it("nothing outside tokens.css reads a primitive — components use semantic tokens", () => {
    const names = [...primitives.keys()].map((name) => name.slice(2)).join("|");
    const direct = new RegExp(`var\\(--(?:${names})\\)`, "g");
    const offenders = files
      .filter((path) => path !== TOKENS_FILE)
      .flatMap((path) => [...read(path).matchAll(direct)].map((match) => `${path}: ${match[0]}`));
    expect(offenders).toEqual([]);
  });
});
