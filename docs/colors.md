# Colours

Every colour the app shows comes from [`tokens.css`](../src/styles/tokens.css), in three
layers. A test fails on a colour written anywhere else. The palette follows the
[Material Design 2 colour system](https://m2.material.io/design/color/the-color-system.html):
its grey, its tonal palettes, its swatches, its baseline error and its
[dark theme](https://m2.material.io/design/color/dark-theme.html).

## Layers

| Layer         | Where                                                         | Holds                                                                                                                                                                   |
| ------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Primitives | the first `:root` block of `tokens.css`                       | Scales (`--green-700`, `--grey-900`, `--dark-grey-6`, `--orange-800`), tint sets, series tones, `--white`, `--black`, the heat map's ColorBrewer classes. Never a role. |
| 2. Semantic   | `:root, [data-export-palette]` (light) and `html.dark` (dark) | Roles — `--color-surface`, `--color-text`, `--color-primary`, `--color-chart-temp-max`, `--color-series-1`… — each pointing to a primitive with `var()`.                |
| 3. Components | everywhere else                                               | Semantic tokens only: `bg-[var(--color-surface)]`, `"var(--color-chart-humid)"`. Never a primitive, never a value.                                                      |

Primitives are the only place a colour value is written, each `#rrggbb` once. Their names
describe the colour, never its use.

## Primitives

| Group               | Names                                                     | Source                                                                         |
| ------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| White, black        | `--white`, `--black`                                      |                                                                                |
| Grey                | `--grey-50/200/300/500/900`, `--grey-black-60`            | M2 Grey, the steps in use; `grey-black-60` is black at 60 % over white, opaque |
| Dark grey           | `--dark-grey-6` … `--dark-grey-66`                        | M2 dark theme surfaces: white overlays on `#121212`, named by CIELAB lightness |
| Green               | `--green-50` … `-900`                                     | M2 tonal palette built from the brand, `#1d9e75`                               |
| M2 swatches         | `--red-300/700`, `--orange-300/800/900`, `--blue-200…900` | stock M2 palettes, only the steps in use                                       |
| Crimson             | `--crimson`                                               | M2 baseline error `#b00020`                                                    |
| Tint sets           | `--tint-light-<hue>-<tone>`, `--tint-dark-<hue>-<tone>`   | badges and chips (see below); crimson's set holds the error alert surfaces     |
| Calm tones          | `--calm-<hue>-<tone>`                                     | the series' lines and bars at moderate chroma (see Series colours)             |
| ColorBrewer classes | `--rdylbu-1` … `-9`, `--ylgnbu-1` … `-4`                  | RdYlBu, 9 classes (cold → hot); YlGnBu, 4 classes (dry → wet)                  |

### Green: the tonal palette from the brand

M2 builds a palette of ten steps, 50 (lightest) to 900, around one key colour. Green's key is
the brand, `#1d9e75` (CIELAB lightness 58): it falls between 500 and 600, so the palette is
generated around it rather than containing it. Each step sits at a fixed lightness, the light
steps tinted toward white, the dark ones shaded toward the colour multiplied by itself, so the
hue holds while chroma eases off at both ends.

| Step  | 50  | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
| ----- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Green | 95  | 88  | 80  | 72  | 66  | 59  | 54  | 48  | 42  | 31  |

(CIELAB lightness, rounded.)

### Data colours: clean, calm tones

Data colours — the series' lines, markers and bars, the chart's variables, the arid bars, the
frost band — are stock M2 swatches, the brand's own steps or the calm tones, each picked as a
colour, never a palette derived at another hue: a derived orange at green's lightness and chroma
turns brown at its middle and dark steps.

### Tint sets

A tint set is one hue's badge colours: a background, a border and a text colour for the light
theme, then the same three for the dark. Every hue uses the same lightness for each role, so a
Martonne badge, a cell count badge, a chip and the month badge weigh the same whatever their hue:

| Theme | Background | Border | Text |
| ----- | ---------- | ------ | ---- |
| Light | 95         | 84     | 34   |
| Dark  | 20         | 34     | 85   |

The tone in a primitive's name is the set's target (a hue may sit one or two off it). Hues:
deep orange, orange, amber, light green, green, cyan, blue, indigo, pink, deep purple, red, blue
grey. Orange's light set is the exception: M2 Orange 50 and 200 for the background and border,
and a saturated orange at tone 42 for the text (`#a84300`), since orange at tone 34 turns brown;
it still reaches 4.5:1. Crimson's alert surfaces (`--tint-light-crimson-95/81`, `--tint-dark-crimson-18/28`) are
a smaller set: the error text is `--crimson` itself, and its names carry their real tones.

### Badges

A badge takes all three roles of one tint set — background, 1px border, text — light and dark
alike, through [`Badge`](../src/components/UI/Badge/Badge.tsx) and a `TBadgeTone` of
semantic tokens:

| Badge          | Tokens                                                   | Tint sets                                                                                                                            |
| -------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Martonne class | `--color-martonne-<class>-bg / -border / -text`          | arid deep orange, semi-arid orange, mediterranean amber, semi-humid light green, humid cyan, very humid blue, extremely humid indigo |
| Cell count     | `--color-cell-count-<speed>-bg / -border / -text`        | fast green, moderate amber, slow orange, too many red                                                                                |
| Compared year  | `--color-series-<n>-tint-bg / -border / -text` (n = 1…5) | green, orange, blue, pink, deep purple — the hues of the years' lines                                                                |

A year badge keeps a dot (`--color-series-<n>-tint-dot`) matching its line on the chart. The
dot needs 3:1 on the badge's tint, so a badge dot may be one step darker than its series line:
the light lines of years 1 and 2 miss 3:1 on a light tint, so their light dots are `green-600`
(`#199469`) and `orange-900` (`#e65100`); every other dot is the line colour itself. The
contrast test enforces the 3:1. `getSeriesTint(position)` gives the tint set and the dot by the
same place as `getSeriesColor`.

The year chips above a chart of compared years take the same tint set: `Chip`'s optional `tone`
sets it as custom properties (`--chip-tone-bg / -border / -text`) that its active, locked and
hover states read, the dot before the label being the tint's dot. A chip without a tone keeps the
active chip's green, as the month badge and the filter chips use the blue grey and green sets.

## Series colours

### Lines and bars

Every series 1–5 has two roles in both themes: a line colour (`--color-series-<n>`: lines,
markers, dots, its identity) and a bar colour (`--color-series-<n>-bar`). A compared pair's A and
B are series 1 and 2, so the compared weather years 1 and 2 look the same as A and B on every
comparison page (Compare Cities, Compare Periods, a single city's Walter-Lieth):

| Series       | Light line                 | Light bar                  | Dark line                  | Dark bar                   |
| ------------ | -------------------------- | -------------------------- | -------------------------- | -------------------------- |
| 1 (A) green  | `green-500` `#22a274`      | `green-300` `#5ec397`      | `calm-green-65` `#4caf8a`  | `calm-green-47` `#2e7d62`  |
| 2 (B) orange | `orange-800` `#ef6c00`     | `orange-300` `#ffb74d`     | `calm-orange-73` `#f5a04a` | `calm-orange-52` `#b8692a` |
| 3 blue       | `calm-blue-50` `#3b78c2`   | `calm-blue-68` `#7fa9dc`   | `calm-blue-64` `#6f9fd8`   | `calm-blue-44` `#3f6a9e`   |
| 4 rose       | `calm-rose-48` `#c2456e`   | `calm-rose-67` `#e08aa5`   | `calm-rose-62` `#d97a95`   | `calm-rose-43` `#9c4a63`   |
| 5 purple     | `calm-purple-46` `#7e57c2` | `calm-purple-66` `#ae93db` | `calm-purple-63` `#a68bd6` | `calm-purple-42` `#6d5a96` |

- **Bars are quieter than lines:** lighter in the light theme, darker and less saturated in the
  dark. The contrast test enforces it.
- **No line stands out:** the five line colours of a theme carry similar weight — at close
  lightness, the light lines saturated enough not to look grey, the dark ones calm enough not to
  glow — rather than one saturated series among pale ones. The bars of a theme match each
  other's weight too.
- **Contrast:** lines and markers need 3:1 on the surface (WCAG 1.4.11); the contrast test
  enforces it. Bar fills don't need it: every bar's value is also in the monthly values table
  and the tooltip, so a bar is a flat fill with no border.

`getSeriesColor(position)` and `getSeriesBarColor(position)` give a weather year its two
colours; a series carries them as `color` and `barColor`. A pair's sides read the same tokens
through `getPairPalette` and `getPairIdentityColor`.

A side's three temperature lines share its colour and differ by dash, on every standard chart
(`CHART_LINE_DASH`): maximum solid, mean dashed, minimum dotted.

### Text in a series' colour

- **Never in a series colour:** text below large-text size (24px, or 18.66px bold). The values
  in the stats table, the monthly values table, every chart tooltip and their exports use the
  text colour.
- **The series shows by its marker instead:** A a dot, B a square, a weather year a dot in its
  colour. The marker sits in the stats table's column header, before each series' values in an
  overlay's monthly values table (beside the unit, and before each value in the vertical table;
  in exports too), before each series' rows in a tooltip of several series (`StandardTooltip`,
  `OverlayTooltip`), and in the legend.
- **Or by a legend swatch, in a tooltip of one series** (a single chart, a side-by-side panel,
  the single Walter-Lieth chart). It shows no marker. Each row, still in the text colour, follows
  its variable's swatch (`LegendSwatch`): the same shape, dash and colour as that chart's legend.
  A Walter-Lieth month's period gets the humid or arid hatching. On a chart coloured by aridity,
  a month's precipitation gets the arid or humid bar.
- **The large-text exception:** large text, such as the city or period on a difference card, may
  keep the series colour, since the line colour reaches 3:1.
- **One helper decides:** `getSeriesTextColor({ color, isLargeText })` in
  [`seriesColor.util.ts`](../src/utils/seriesColor.util.ts). It returns `SERIES_TEXT_COLOR`
  for small text; an export passes its resolved `textColor`.

## Chart variables

| Token                    | Light                  | Dark                   |
| ------------------------ | ---------------------- | ---------------------- |
| `--color-chart-temp-max` | `red-700` `#d32f2f`    | `red-300` `#e57373`    |
| `--color-chart-temp-min` | `blue-700` `#1976d2`   | `blue-300` `#64b5f6`   |
| `--color-chart-temp-avg` | `orange-800` `#ef6c00` | `orange-300` `#ffb74d` |
| `--color-chart-arid`     | `orange-300` `#ffb74d` | `orange-800` `#ef6c00` |
| `--color-chart-humid`    | `blue-200` `#90caf9`   | `blue-800` `#1565c0`   |

The arid and humid bars mirror each other: the light theme's light step, the dark theme's
darker one.

### The Walter-Lieth frost band

Certain frost (`--color-wl-frost`) is dark blue: `blue-900` `#0d47a1` (light), `blue-700`
`#1976d2` (dark), both above 3:1 on the surface. Light blue means something else in the
diagram and is never used for frost. The temperature red and precipitation blue keep the
Walter-Lieth convention.

## Primary and brand

The brand green has two roles, so that green which carries no small text can stay light:

| Token                                      | Light               | Dark                | For                                                                                                                                                                                              | Contrast          |
| ------------------------------------------ | ------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| `--color-primary`, `--color-primary-hover` | `green-700`, `-800` | `green-200`, `-100` | filled controls carrying `--color-on-primary` text (buttons, the active chip and nav link, the switch track, the selected option); green text below large-text size (links, the active nav link) | 4.5:1             |
| `--color-brand`                            | `green-500`         | `green-200`         | large text (24px, or 18.66px bold: page headings), the logo, map shapes and markers, outlines, focus rings, icons and other graphics, progress bars                                              | 3:1 (WCAG 1.4.11) |

Never put `--color-on-primary` text on `--color-brand`. When unsure, use `--color-primary`. The
logo's name beside the mark uses the brand at any size: text in a logo is exempt (WCAG 1.4.3).

## Contrast

Every pair a reader depends on reaches WCAG 2.x contrast in both themes:

- **4.5:1** — text: `on-primary` on `primary`; `text` and `text-secondary` on `surface` and
  `surface-secondary`; `error` on `error-bg`; every badge's text on its background (Martonne,
  cell count, month, active chip, compared year), and every tint set's text on its background.
- **3:1** — `brand` on `surface`: large text, graphics, outlines; on `surface`, the data marks:
  each `--color-series-<n>` (lines, markers, large text), the chart's temperature lines and the
  frost band; each `--color-series-<n>-tint-dot` on its `--color-series-<n>-tint-bg`: a year badge's
  dot. Bar fills have no ratio: their values are in the values table and the tooltip.

A badge's border needs no ratio: the background and text carry the badge.

[`colorContrast.test.ts`](../tests/unit/styles/colorContrast.test.ts) resolves the semantic
tokens of each theme from `tokens.css` and checks these pairs with `contrastRatio`
([`contrast.util.ts`](../src/utils/contrast.util.ts)). A new text or badge role adds its pair
there.

## Dark theme

`html.dark` remaps semantic tokens to other primitives, following M2's dark theme. A token it
doesn't list keeps its light value in both themes (the map marker, the switch knob, the heat
map).

- **Base:** surfaces are `#121212` (`--dark-grey-6`), not black, so shadows still read and
  elevated surfaces can lighten.
- **Elevation by overlay:** a raised surface is lighter, as if white were laid over `#121212`
  at a higher opacity the higher it sits — the dark grey scale holds those results
  (`surface-secondary`, the control track, the raised segmented pill, borders).
- **Text:** high emphasis is `#e0e0e0` (`--grey-300`), medium `#a0a0a0` — never pure white.
- **Primary and brand:** a lighter, desaturated step (`--green-200`) replaces `--green-700` and
  `--green-500` alike, and text on it turns black (`--color-on-primary`, `--color-on-series`).
- **Data:** lines and markers move to lighter tones (the temperatures, Walter-Lieth), at 3:1 or
  more on `#121212`. The series' dark lines are calm tones, not pastel steps: a light, saturated
  pastel glows on `#121212`, so each series line is a mid-light tone with moderate chroma. Bars
  (the series', arid and humid) move to darker, less saturated tones so they recede behind the
  lines; the frost band to `blue-700`.
- **Error:** `--red-300` on the crimson dark alert surfaces, light enough for small text there.
- **Badges and chips:** each takes its tint set's dark half.

## Other rules

- **Hover** is one neutral state layer, as in M2: `--color-state-hover`, the on-surface colour
  (the text's primitive) at 6% (light) or 8% (dark) over whatever is under it. A hovered month
  takes it on every chart (the band, `CHART_HOVER_COLOR`) and in the monthly values table (its
  column); the dimmed bars of the other months stay readable on the surface beside it. A stats
  table body row takes it on hover too (not the header), only on devices that can hover.
- **Translucent colours** (primary muted, update flash glow, backdrop, shadows, the map marker's
  shadow, the hover state layer) mix a primitive with `transparent`:
  `color-mix(in srgb, var(--black) 40%, transparent)`. A semantic token can't point to another
  one, so a mix of the theme's primary is written in each block with that theme's step.
- **Exports** draw with the light palette in either theme: an element carrying
  `data-export-palette` re-declares the light semantic tokens
  ([`exportPalette.util.ts`](../src/utils/export/shared/exportPalette.util.ts)). Builders may
  receive `var(--token)` strings (a series' colour); `resolveCssVars` replaces each with its
  light value before an SVG or PNG is saved (`downloadSvgString`, `svgToPng`), so a file never
  holds a CSS variable. The export pipeline is in [export.md](export.md).
- **The brand palette is kept whole:** green is an M2 tonal palette, all ten steps 50…900 even
  where a step is unused, and so is every tint set; the next role finds its step there. Grey and
  the M2 swatches keep only the steps in use.

## Reading colours in TypeScript

- **On screen,** pass the token as a string — `"var(--color-chart-temp-max)"` works in style
  props, Recharts, SVG attributes and Leaflet paths.
- **A series' colour** comes from [`seriesColor.util.ts`](../src/utils/seriesColor.util.ts),
  by its position: `getSeriesColor(index)` and `getSeriesBarColor(index)` (compared weather
  years, by their place in the list), `getPairPalette(side)` (A or B: the line colour for every temperature, and the bar
  colour) and `getPairIdentityColor(side)` (A or B on Walter-Lieth, markers, the
  comparison table header). Text takes `getSeriesTextColor` (see above). The tokens behind them
  are `SERIES_COLOR_TOKENS` in [`seriesColor.constant.ts`](../src/constants/seriesColor.constant.ts).
- **A real value** (numbers to interpolate, a file to save) is read with `getComputedStyle`:
  the heat map's scales are stop tokens in
  [`colorScale.constant.ts`](../src/constants/colorScale.constant.ts), resolved by
  `resolveColorScale` from the document (map, legend — `useColorScale` on the client) or from
  the export palette (the image).

## Files that can't read CSS

These hold colour literals, each of which must be one of the primitives (the test checks it):

| File                            | Why                                                   |
| ------------------------------- | ----------------------------------------------------- |
| `src/app/icon.svg`              | the favicon: a static file                            |
| `src/assets/climatica-logo.svg` | the static logo: a static file                        |
| `src/constants/og.constant.ts`  | the OG image: `next/og` renders it without CSS        |
| `src/app/global-error.tsx`      | replaces the root layout when that crashes: no styles |

## The tests

Beside the contrast test above,
[`colorTokens.test.ts`](../tests/unit/styles/colorTokens.test.ts) (`npm run test`) scans
`src/` and fails on:

- a colour literal outside `tokens.css` and the allowlist: `#hex`, `rgb()`, `hsl()`, `hwb()`,
  `lab()`, `lch()`, `oklab()`, `oklch()`, `color()`, a Tailwind palette colour class
  (`bg-green-100`, `text-white`, `text-white/80`) or a named colour as a value
  (`color: "white"`, `solid white`);
- an allowlisted file's colour that isn't a primitive;
- a primitive that isn't a `#rrggbb` value, or a scale missing a step or out of lightness order
  (green: 50…900; grey and the M2 swatches: their steps in use);
- a semantic token holding a value or pointing to anything but primitives;
- a primitive read outside `tokens.css`.

`transparent` and `currentColor` are keywords, not colours: use them freely.

## How to add a colour

A colour joins a scale or a tint set; it never stands alone.

1. **Reuse first.** If a semantic token already has the role, use it. If a primitive already
   has the value, point a new semantic token to it.
2. **A new value:** take a step of a scale or a tint set. If none fits, the colour is a new
   step of an M2 swatch, a new M2 swatch, or a new hue's tint set at the set's tones — or a
   change to the colour. A data colour is a clean swatch, never a tone derived at another hue.
3. **Its role:** add a semantic token (`--color-<role>`) in the light block pointing to it, and
   remap it in `html.dark` to the step the dark theme rules call for.
4. **Use it** through the semantic token. An export needs nothing more.
5. Run `npm run test`.

## How to add a series colour

Weather years take their colours by position from `SERIES_COLOR_TOKENS.LIST` and `BAR_LIST` —
`--color-series-1` … `-5` and their `-bar` tokens — wrapping past the last. A sixth series is
four calm tones of a hue between the others (a light line at the other light lines' lightness
and a lighter bar, a dark line at the other dark lines' lightness and a darker, less saturated
bar), `--color-series-6` and
`--color-series-6-bar` with their dark remaps, and their entries in `LIST` and `BAR_LIST`;
`getSeriesColor` and `getSeriesBarColor` pick them up. Its year badge needs a tint set of the same hue:
`--color-series-6-tint-bg / -border / -text / -dot` (light and dark; the dot one step darker
than the line if the line misses 3:1 on the tint) and an entry in
`SERIES_COLOR_TOKENS.TINT_LIST` for `getSeriesTint`.
