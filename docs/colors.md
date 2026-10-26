# Colours

Every colour comes from [`tokens.css`](../src/styles/tokens.css), in three layers; a test fails on
a colour written anywhere else. The palette follows the
[Material Design 2 colour system](https://m2.material.io/design/color/the-color-system.html) and
its [dark theme](https://m2.material.io/design/color/dark-theme.html).

## Layers

| Layer         | Where                                                         | Holds                                                                                     |
| ------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1. Primitives | the first `:root` block                                       | scales, tint sets, `--white`, `--black`, the heat map's ColorBrewer classes; never a role |
| 2. Semantic   | `:root, [data-export-palette]` (light) and `html.dark` (dark) | roles (`--color-surface`, `--color-chart-temp-max`…), each a `var()` to a primitive       |
| 3. Components | everywhere else                                               | semantic tokens only                                                                      |

A colour value is written once, as a primitive named for the colour, never its use.

## Primitives

| Group       | Names                                                   | Source                                                  |
| ----------- | ------------------------------------------------------- | ------------------------------------------------------- |
| Grey        | `--grey-*`, `--grey-black-60`                           | M2 Grey, the steps in use                               |
| Dark grey   | `--dark-grey-6` … `-66`                                 | M2 dark surfaces: white overlays on `#121212`           |
| Green       | `--green-50` … `-900`                                   | M2 tonal palette around the brand `#1d9e75`, kept whole |
| M2 swatches | `--red-*`, `--orange-*`, `--deep-orange-*`, `--blue-*`  | stock swatches, the steps in use                        |
| Crimson     | `--crimson`                                             | M2 baseline error                                       |
| Tint sets   | `--tint-light-<hue>-<tone>`, `--tint-dark-<hue>-<tone>` | badge and chip colours                                  |
| ColorBrewer | `--rdylbu-*`, `--ylgnbu-*`                              | heat map classes                                        |

Data colours are stock swatches, never a palette derived at another hue: a derived orange at
green's lightness turns brown.

**Tint sets:** one hue's background, border and text, light then dark, at the same lightness for
every hue (light 95 / 84 / 34, dark 20 / 34 / 85), so badges of different hues weigh the same.
Orange's light text is the exception (`#a84300`): orange at tone 34 turns brown.

**Badges** ([`Badge`](../src/components/UI/Badge/Badge.tsx)) take one tint set's three roles:
Martonne classes (`--color-martonne-<class>-*`), cell counts (`--color-cell-count-<speed>-*`). A
compared year's badge is neutral (`YEAR_BADGE_TONE`) and carries the year's shape.

## Entities: shapes and hatches, not colours

Charts use semantic colours only. An entity is told apart by its marker — a shape on its curves,
a hatch (or shade) on its overlay bars — assigned by its marker slot
([charts.md](charts.md#marker-identity)):

| Slot           | 0 (A)  | 1 (B)    | 2        | 3          | 4     |
| -------------- | ------ | -------- | -------- | ---------- | ----- |
| Shape (curves) | circle | square   | triangle | diamond    | cross |
| Hatch (bars)   | solid  | diagonal | dots     | horizontal | cross |

- **One source:** `SERIES_SHAPES` and `SERIES_HATCHES`
  ([`seriesShape.constant.ts`](../src/constants/seriesShape.constant.ts)). `getMarkerPath` draws
  every shape and `getHatchTile` every hatch — screen, export, map icon.
- **Colour:** markers are `--color-series-marker`, a neutral graphite at 3:1 on the surface. On
  maps, the mini map's markers take the main map's selected-place marker (`MAP_MARKER`: brand
  green, white outline), each in its entity's shape.
- **Where the swatch shows** beside the shape: only where the view draws per-entity bars
  (`getSwatchBarStyle`, [charts.md](charts.md#bar-styles)).

### Precipitation bars

- **Fill:** by the month's aridity for its own entity — `--color-chart-humid` or
  `--color-chart-arid` (`PRECIP_BAR`) — on every standard chart and in exports.
- **Overlay:** by the bar style ([charts.md](charts.md#bar-styles)). Hatches are knocked out in
  the card's surface (`--color-chart-bar-hatch`), on 8 px tiles (`SERIES_HATCH_GEOMETRY`); an
  overlay bar is never under 8 px, so every hatch stays legible.
- **Shades:** `--color-chart-humid-shade-1…5` and `--color-chart-arid-shade-1…5`
  (`PRECIP_BAR_SHADES`), light to dark by marker slot. Each step stays apart from the card
  (≥ 1.7:1 light, ≥ 3.2:1 dark) and from its neighbour (CIELAB ΔE ≥ 13).
- **Focus context:** the non-focused entities turn plain gray (`FOCUS_CONTEXT`:
  `--color-chart-context-line`, `--color-chart-context-bar`, `--color-text-secondary` in the
  table) — no hue, no opacity.
- Bar fills need no contrast ratio: every value is also in the values table and the tooltip.

**Text** never takes an entity's colour: values and names are in the text colour, the entity
shown by its shape beside them.

## Chart variables

| Token                    | Light        | Dark         |
| ------------------------ | ------------ | ------------ |
| `--color-chart-temp-max` | `red-700`    | `red-300`    |
| `--color-chart-temp-min` | `blue-700`   | `blue-300`   |
| `--color-chart-temp-avg` | `orange-800` | `orange-300` |
| `--color-chart-arid`     | `orange-300` | `orange-800` |
| `--color-chart-humid`    | `blue-200`   | `blue-800`   |

Arid and humid mirror each other between themes. The Walter-Lieth frost band is dark blue
(`--color-wl-frost`): light blue already means something else in the diagram.

## Primary and brand

| Token             | Light       | Dark        | For                                                                         | Contrast |
| ----------------- | ----------- | ----------- | --------------------------------------------------------------------------- | -------- |
| `--color-primary` | `green-700` | `green-200` | filled controls with `--color-on-primary` text; green text below large size | 4.5:1    |
| `--color-brand`   | `green-500` | `green-200` | large text, the logo, map shapes, outlines, focus rings, icons, progress    | 3:1      |

Two roles so green that carries no small text can stay light. Never put `--color-on-primary` on
`--color-brand`; when unsure, use `--color-primary`.

## Contrast

Every pair a reader depends on reaches WCAG contrast in both themes: 4.5:1 for text (on surfaces,
on primary, every badge's text on its background), 3:1 for the brand on the surface, the entity
markers, the temperature lines and the frost band. Badge borders need none.
[`colorContrast.test.ts`](../tests/unit/styles/colorContrast.test.ts) resolves each theme's tokens
and checks these pairs; a new text or badge role adds its pair there.

## Dark theme

`html.dark` remaps semantic tokens (a token it doesn't list keeps its light value):

- Surfaces are `#121212`, not black; raised surfaces lighten (the dark grey scale).
- Text is `#e0e0e0` / `#a0a0a0`, never pure white.
- Primary and brand both become `green-200`, with black text on it.
- Lines and markers move lighter; bars move darker and less saturated, so they recede behind the
  lines.
- Badges and chips take their tint set's dark half.

## Other rules

- **Hover** is one neutral state layer (`--color-state-hover`): the hovered month's band on every
  chart and its values-table column, a stats-table body row on hover-capable devices.
- **Translucent colours** mix a primitive with `transparent` (`color-mix`): a semantic token can't
  point to another, so a mix of the theme's primary is written in each theme block.
- **Exports** use the light palette in either theme and never contain a CSS variable
  ([export.md](export.md#colours-the-export-palette)).
- **In TypeScript** pass the token as a string (`"var(--color-chart-temp-max)"`); read a real value
  with `getComputedStyle` only where numbers are needed (the heat map's scales, `resolveColorScale`).

## Files that can't read CSS

These hold colour literals, each one a primitive's value: `src/app/icon.svg`,
`src/assets/climatica-logo.svg`, `src/constants/og.constant.ts` (rendered by `next/og`),
`src/app/global-error.tsx` (replaces the root layout).

## The tests

[`colorTokens.test.ts`](../tests/unit/styles/colorTokens.test.ts) fails on: a colour literal outside
`tokens.css` and the allowlist (any CSS colour function, a Tailwind palette class, a named colour);
an allowlisted colour that isn't a primitive; a primitive that isn't `#rrggbb`; a scale missing a
step or out of lightness order; a semantic token holding a value or pointing to a non-primitive; a
primitive read outside `tokens.css`. `transparent` and `currentColor` are fine.

## Adding a colour or a shape

1. Reuse a semantic token or point a new one to an existing primitive.
2. A new value is a step of a scale or a tint set — never a standalone colour.
3. Add `--color-<role>` in the light block, remap it in `html.dark`, use it through the token.
4. Run `npm run test`.

A sixth entity shape: add it to `SERIES_SHAPES` and its path to `getMarkerPath`. Nothing else.
