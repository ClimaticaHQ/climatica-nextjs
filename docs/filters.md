# Filters

Filters are the values that decide what data a page loads: dataset, climate period or
weather year, variables, resolution, months, and Compare Periods' two periods or compared
years. They live only in the URL (see [url-state.md](url-state.md)); the components here
edit them.

## FILTERS_CONFIG: one description per filter

[`FILTERS_CONFIG`](../src/constants/filters.constant.ts) describes every filter once. The
sidebar, the mobile chips and sheet, the URL and the badge all read from it. Its type is
[`TFilterConfig`](../src/types/filters/filters.type.ts):

| Field                     | Meaning                                                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `param`, `legacyParams`   | The URL param written, and old params still read.                                                                                                          |
| `labelKey`                | The section title's translation key.                                                                                                                       |
| `choice`                  | `SINGLE` (applies on pick in a single-filter sheet), `MULTI`, or `INPUT` (needs Apply).                                                                    |
| `placement`               | `SECTION` (sidebar, chips, sheets) or `PAGE_BELOW_LG` (Compare Periods' periods and years: on the page below lg, a sidebar section from lg, never a chip). |
| `views`                   | The pages that show it ([`EFilterView`](../src/enums/filters.enum.ts)).                                                                                    |
| `dataset`                 | The only dataset it applies to; absent means both.                                                                                                         |
| `unavailableWhen`         | Reasons it's shown but disabled (see availability below).                                                                                                  |
| `defaultValue`, `options` | The default (also in `FILTER_DEFAULTS`) and the choices.                                                                                                   |

[`FILTER_ORDER`](../src/constants/filters.constant.ts) is the order of sections, chips and
URL params. Each filter's URL encoding is its codec in
[`FILTER_CODECS`](../src/utils/filterCodecs.util.ts).

## Availability

[`getFilterAvailability`](../src/utils/filters.util.ts) decides, per filter and context
(view, dataset, Walter-Lieth shown):

- **Hidden** — not in this view's `views`, or not relevant to the dataset. Not rendered.
- **Disabled with a reason** — the first `unavailableWhen` reason that applies:
  - `WALTER_LIETH`: the Walter-Lieth diagram plots mean temperature and precipitation for
    all 12 months, so variables and months are disabled. The note offers "Switch to
    standard chart" where a container provides the action.
  - `HEAT_MAP`: months don't apply to the heat map; the section is dimmed, with its note
    above.
    The notes and their layout are [`FILTER_UNAVAILABLE_NOTE_KEYS`](../src/constants/filters.constant.ts)
    and `FILTER_UNAVAILABLE_LAYOUTS`.
- **Available** otherwise.

Which filters appear where:

- [`getSidebarFilterKeys`](../src/utils/filters.util.ts): every non-hidden filter (from lg).
- `getSectionFilterKeys`: the full sheet, without page-placed filters.
- `getChipFilterKeys`: chips for available filters, plus the Walter-Lieth-disabled ones,
  which open an explanation ([`FILTER_CHIP_AVAILABILITIES`](../src/constants/filters.constant.ts)).

The "Filters" badge counts available chip filters away from their default
(`countChangedFilters`).

## Components

All in [`src/components/filters/`](../src/components/filters):

- **Sections** ([`sections/`](../src/components/filters/sections)): one component per
  filter (`DatasetFilter`, `PeriodFilter` for the climate period or weather year,
  `VariablesFilter`, `ResolutionFilter`, `MonthsFilter`, `ComparedPeriods`). Each receives
  the same props ([`TFilterSectionRenderProps`](../src/components/filters/filters.type.ts)):
  values in, `onChange(key, value)` out. They don't know where they're rendered or when a
  change applies.
  `ComparedPeriods`' Climate pair puts its swap button (`SwapButton` with `isInline`) at the
  end of Period B's label row, so both label rows stay the same height.
- **[`FilterSections`](../src/components/filters/FilterSections.tsx)** renders the sections
  for a list of keys, through [`FILTER_SECTION_COMPONENTS`](../src/components/filters/filters.constant.ts)
  (filter key → component).
- **[`FilterSection`](../src/components/filters/FilterSection.tsx)** is the shell: title,
  controls, and the unavailable note. `FilterNote` is a section's note (info, muted, error,
  with an optional action).

Three containers render the sections, one per breakpoint:

| Container                                                                                                             | Where                              | Applies                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`FiltersSidebar`](../src/components/filters/FiltersSidebar.tsx)                                                      | lg and up, `AppLayout`             | A draft: auto-apply (replace) or the Apply button (push).                                                                                                                  |
| [`FilterBar`](../src/components/filters/FilterBar.tsx) + [`FiltersSheet`](../src/components/filters/FiltersSheet.tsx) | below lg, under each page's search | Chips open the sheet: every filter (Apply pushes), one filter (single-choice filters apply on pick, others with Apply; both replace), or why a disabled chip can't change. |
| [`ComparedPeriods`](../src/components/filters/sections/ComparedPeriods.tsx)                                           | Compare Periods page, below lg     | Immediately (replace).                                                                                                                                                     |

Each container renders only at its breakpoint ([`LG_MEDIA_QUERY`](../src/constants/breakpoint.constant.ts)),
so a control never exists twice.

## Draft and auto-apply

The sidebar and the sheet edit a draft ([`useFiltersDraft`](../src/hooks/filters/useFiltersDraft.ts)):

- It starts from the applied filters and follows them when they change (Back/Forward, a
  canonical replace), so nothing applies twice.
- `setFilter` normalizes after each change; `setFilters` changes several values at once
  (the Climate A ↔ B swap), so a pair is never equal halfway.
- `submit()` returns the filters to apply, or `null` while the typed year is invalid (its
  error shows from then on).
- On the heat map it counts the cells a resolution would load for the region (a box, or the
  box around a polygon); above `FILTER_MAX_HEATMAP_CELLS` (2,000) Apply is blocked and the
  section says why. The page itself doesn't load a region drawn over the cap (see
  [backend.md](backend.md)).
  The count is a [`CellCountBadge`](../src/components/filters/CellCountBadge.tsx), the same
  badge the map shows live on a box or polygon while it's drawn (its box's cells, at the
  current resolution), red past the cap.

Auto-apply ([`useAutoApply`](../src/hooks/filters/useAutoApply.ts)) applies the sidebar's
draft once it has been unchanged for `AUTO_APPLY_DEBOUNCE_MS` (200 ms), when the setting is
on and Apply isn't blocked. The sheet below lg writes through
[`useFiltersSheet`](../src/hooks/filters/useFiltersSheet.ts), which closes the sheet before
navigating (see [url-state.md](url-state.md)).

## How to add a new filter

1. **Key and type.** Add the key to [`EFilterKey`](../src/enums/filters.enum.ts); its value
   is also the field name. Add the field to [`TFilters`](../src/types/filters/filters.type.ts).
2. **Config.** Add the param name to [`SIDEBAR_PARAMS`](../src/constants/sidebar.constant.ts),
   the default to `FILTER_DEFAULTS`, an entry to `FILTERS_CONFIG`, and the key to
   `FILTER_ORDER` where its section should appear.
3. **URL codec.** Add `parse` and `encode` to [`FILTER_CODECS`](../src/utils/filterCodecs.util.ts),
   with a parser in [`urlParams.util.ts`](../src/utils/urlParams.util.ts) that returns
   `null` for absent or invalid values. If the value needs fixing up when other filters
   change, extend [`normalizeFilters`](../src/utils/filters.util.ts).
4. **Section.** Add a component in [`sections/`](../src/components/filters/sections) that
   takes `TFilterSectionRenderProps` and wraps its controls in `FilterSection` (pass
   `availability` if the filter can be disabled). Map the key to it in
   `FILTER_SECTION_COMPONENTS`. Reuse UI primitives (Chip, Dropdown, YearInput) rather than
   new controls.
5. **Chip.** Add the value's short form to `CHIP_FORMATTERS` in
   [`filterChips.util.ts`](../src/utils/filterChips.util.ts).
6. **Text.** Add the section title (`labelKey`) and `filters.names.<key>` in all 10 locale
   files (see [localization-i18n.md](localization-i18n.md)).
7. **Use it.** Read it with `useFilters()` in the page hooks or data hooks that
   depend on it.
8. **Tests.** Round-trip the codec and the canonical form (`tests/unit/utils/`), the
   availability rules, and a Playwright check that the URL changes when it's edited (see
   [testing.md](testing.md)).
