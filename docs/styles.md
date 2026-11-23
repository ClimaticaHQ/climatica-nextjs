# Styles: typography and text size

Text sizes live in [`typography.css`](../src/styles/typography.css), imported right after
`tokens.css` (colours, radii, shadows; [colors.md](colors.md)).

## typography.css

- **Root:** `html { font-size: calc(100% * var(--text-scale)) }`. 100% is the browser's default
  font size, so the user's browser setting scales every text (WCAG 1.4.4). `--text-scale` is the
  app's text size (below); the two multiply.
- **Tokens**, all in rem (16px = 1rem), on `:root` and `[data-export-palette]`:
  - the app scale `--font-2xs` … `--font-2xl` (11–36px), with `--font-tooltip` (13px);
  - `--leading-xs` / `--leading-base`: line heights as ratios of the font;
  - the reading scale `--font-reading-*` (Info pages from lg) and `--reading-measure`;
  - the touch scale `--font-touch-*` (below lg) and `--touch-label-tracking`.
- Components use `text-[length:var(--font-…)]`. A size used once may be a rem value; a size used
  twice gets a token. Never px.

## What stays in px

Borders and hairlines, radii, icon strokes, marker geometry, map and plot heights, the 44px
minimum tap target, and everything in the exports (fixed-size files, [export.md](export.md)).

## Text size

The setting (Smaller to Larger: [settings.md](settings.md#text-size)) sets `--text-scale`, so all
rem text and spacing follow. Below Default, floors keep things usable; at Default and above they
change nothing:

- **Text:** `--font-2xs` and `--font-xs` are `max(<rem>, 11px)`, so no text goes below 11px; a
  plain rem size under 0.75rem gets a px floor at its default size (the small Badge, 10px).
- **Charts:** `scaleChartFont` floors ticks at 10px and other chart text at 11px
  (`CHART_TEXT_MIN_PX`); axis widths follow the actual tick size.
- **Targets:** 44px is px everywhere (`min-h-target`, `size-target`: `max(2.75rem, 44px)`), and
  the spacing a target reaches into keeps its default size (`touch-gap-*`, px-floored gaps).

On-screen charts draw in SVG px, so they follow the scale in code: On-screen charts draw in SVG px, so they follow it in code:

- `useTextScale` reads the effective scale (the root's font size / 16: browser and app together);
  chart cards and figures pass it through `ChartDeviceContext`.
- The axis helpers take `textScale` (`getAxisStyle`, `getUnitTitleFontSize`, `getPlotMargin`,
  `getChartMargin`, `getXAxisProps`, `getMonthLabelFormat`): ticks, °C / mm titles, axis widths
  (and the values table's unit column), the top margin and the month label threshold grow with
  it; plot heights don't. The legend, tooltip swatches, figure annotations
  (`scaleAnnotationLayout`) and the nested cells labels scale too.
- Exports never read it: the helpers default to 1 and the builders use the base constants, so a
  file is the same at every size ([`textSize.e2e.ts`](../tests/e2e/textSize.e2e.ts)).

## Text size in shared components

- **Tap targets:** the `touch-target` utility ([`utilities.css`](../src/styles/utilities.css))
  gives a control a transparent ::before of at least 44px below lg, without changing its look.
  Neighbouring targets never overlap: a row or list sets `touch-gap-*` (`-x-*`, `-y-*`), so each
  reaches at most half the gap, and a capped side leaves the rest to the other side. A scroller
  gets room above and below so it doesn't clip them, and only its chips take taps. An input
  can't draw a ::before: a label around it (`FIELD_TARGET`) carries the target. The inline swap
  between the filter bar and the period dropdowns is the one target short of 44px.
- **Wrapping over cutting:** table heads wrap to two lines before an ellipsis, a value's badge
  wraps under it, wide tables scroll in their own box.
- **Settings page:** one flat card, no shadows. Hairlines between sections and rows are one
  top band of `--color-divider`, `--divider-width` thick (1px, 0.5px from 2dppx: one device pixel).
  `SegmentedControl` `isFlat` there: an outlined card-surface pill, primary text; labels always
  shown (`isIconOnlyBelowSm` is the chart toolbars' icon-only fallback). Rows wrap by one rule
  (settings.md).
- **SegmentedControl icons:** 1.15em of the segment's text, 0.4em from the label, so they grow
  with the text size; `size` COMPACT is a shorter pill below `sm` with its 44px target drawn around
  it.
- **SegmentedControl layouts:** labels stay on one line, never broken. Below `sm`, when one label
  and its icon don't fit an equal segment of the most room the control can take, the whole control
  becomes a vertical list: one 44px option per line across that room (`useSegmentLayout`, from
  widths alone, so it can't oscillate). Otherwise, and from `sm` up, inline. `isLabelTruncated`
  (a control in a fixed box) never lists: the labels are cut with an ellipsis instead, each
  option keeping its full label as its name and title.
- **StepSlider** ([`UI/StepSlider`](../src/components/UI/StepSlider)): a native range input with a
  dot per step (`aria-valuetext` is the step's name), a flat thumb (`--color-slider-thumb`, 1px
  border, focus outline). It keeps one physical size at every text size, so it doesn't jump as the
  size it sets changes: px for the thumb and track, rem ÷ `--text-scale` for its width and "A"
  glyphs (`--font-xs-unscaled`, `--font-xl-unscaled`). Its input is 44px tall below lg.
- **Navbar:** from lg its links collapse into the menu when they no longer fit on one line,
  measured (`useNavbarFit`), whatever the language or text size. One pill slides under the
  highlighted link: the page being opened from the click (`pendingRoute` in
  `useNavbarNavigation`, a transition), the current one once it's in or if the navigation is
  dropped. The links' colours crossfade with it. The menu doesn't slide.
- **Sliding indicators** ([`useSlidingIndicator`](../src/hooks/ui/useSlidingIndicator.ts),
  [`UI/SlidingIndicator`](../src/components/UI/SlidingIndicator)): one absolute element on a
  list's active item, placed by `transform` and sized by width / height from the item's rendered
  box (`getIndicatorRect`), measured before paint. The server's HTML keeps the item's static
  highlight; the indicator takes over in the same frame after hydration. It slides only to a new
  item once placed (`nav-indicator` 220 ms, `section-indicator` 200 ms, the SegmentedControl's
  pill; `MOTION.INDICATOR_SLIDE_EASING`, retargeting mid-flight) and jumps on its first
  placement, a resize, a text size change or a font arriving. Motion off: it always jumps.

## Breakpoints

Breakpoints are in rem, like Tailwind v4's (`sm` 40rem, `lg` 64rem). JS media queries
(`LG_MEDIA_QUERY`, `SM_MEDIA_QUERY`) use the same rem values, never px or `innerWidth`, so CSS and
JS switch together. In a media query rem is the browser's default size, so a larger browser font
moves the breakpoints (lg at 1280px for 20px); the app's text size doesn't (media queries never
read `<html>`'s font size). Checked by
[`browserFontSize.e2e.ts`](../tests/e2e/browserFontSize.e2e.ts).
