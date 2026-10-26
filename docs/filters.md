# Filters

The values that decide what data a page loads: dataset, climate period or weather year, variables,
resolution, months, and Compare Periods' periods or years. They live only in the URL
([url-state.md](url-state.md)); the components here edit them.

## FILTERS_CONFIG

[`FILTERS_CONFIG`](../src/constants/filters.constant.ts) describes every filter once; the sidebar,
the chips and sheets, the URL and the badge all read it ([`TFilterConfig`](../src/types/filters/filters.type.ts)):

| Field                     | Meaning                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `param`, `legacyParams`   | the URL param, and old ones still read                                                       |
| `choice`                  | `SINGLE` (applies on pick in its own sheet), `MULTI`, `INPUT` (needs Apply)                  |
| `placement`               | `SECTION`, or `PAGE_BELOW_LG` (Compare Periods' periods: on the page below lg, never a chip) |
| `views`, `dataset`        | the pages that show it; the only dataset it applies to (absent: both)                        |
| `unavailableWhen`         | reasons it's shown but disabled                                                              |
| `defaultValue`, `options` | default and choices                                                                          |

`FILTER_ORDER` orders sections, chips and params; each filter's URL encoding is its codec in
[`FILTER_CODECS`](../src/utils/filterCodecs.util.ts).

## Availability

[`getFilterAvailability`](../src/utils/filters.util.ts), per filter and context (view, dataset,
Walter-Lieth shown):

- **Hidden:** not in the view, or not for the dataset.
- **Disabled with a reason** (the first `unavailableWhen` that applies):
  - `WALTER_LIETH`: the diagram always plots mean temperature and precipitation for every month,
    so variables and months are disabled, with "Switch to standard chart" where possible;
  - `HEAT_MAP`: months don't apply to the heat map.
- **Available** otherwise.

The sidebar shows every non-hidden filter (`getSidebarFilterKeys`); the full sheet the same minus
page-placed ones; chips the available filters plus the Walter-Lieth-disabled ones, which open an
explanation (`getChipFilterKeys`). The "Filters" badge counts available chip filters away from
their default (`countChangedFilters`).

A chip shows its value short (`CHIP_FORMATTERS`, [`filterChips.util.ts`](../src/utils/filterChips.util.ts)):
one variable by name, several by count ("3 variables", locale plurals); one month by name, several
by count.

## Components

In [`src/components/filters/`](../src/components/filters):

- **Sections** ([`sections/`](../src/components/filters/sections)), one per filter, all with the
  same props (`TFilterSectionRenderProps`: values in, `onChange(key, value)` out); they don't know
  where they render or when a change applies. `FilterSections` renders a list of keys through
  `FILTER_SECTION_COMPONENTS`; `FilterSection` is the shell (title, controls, note).
- **Compare Periods' years** ([`ComparedPeriods`](../src/components/filters/sections/ComparedPeriods.tsx))
  are listed in the page's order with each year's marker, read from the URL
  ([`useComparedYears`](../src/hooks/filters/useComparedYears.ts), [charts.md](charts.md#marker-identity)).

Three containers, each rendered only at its breakpoint (`LG_MEDIA_QUERY`), so a control never
exists twice:

| Container                                                                                                             | Where                     | Applies                                                                       |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------- |
| [`FiltersSidebar`](../src/components/filters/FiltersSidebar.tsx)                                                      | lg and up                 | a draft: auto-apply (replace) or Apply (push)                                 |
| [`FilterBar`](../src/components/filters/FilterBar.tsx) + [`FiltersSheet`](../src/components/filters/FiltersSheet.tsx) | below lg                  | chips open one filter's sheet (replace), all filters (push) or an explanation |
| `ComparedPeriods`                                                                                                     | Compare Periods, below lg | immediately (replace)                                                         |

## Draft and auto-apply

The sidebar and sheet edit a draft ([`useFiltersDraft`](../src/hooks/filters/useFiltersDraft.ts)):

- It starts from the applied filters and follows them (Back/Forward, a canonical replace), so
  nothing applies twice.
- `setFilter` normalizes after each change; `setFilters` changes several at once (the A ↔ B swap),
  so a pair is never equal halfway.
- Switching to the dataset the URL doesn't hold restores what the last switch away dropped
  ([url-state.md](url-state.md#a-dataset-switch)).
- `submit()` returns the filters, or `null` while a typed year is invalid.
- On the heat map it counts the cells a resolution would load (a
  [`CellCountBadge`](../src/components/filters/CellCountBadge.tsx)); past the cap Apply is blocked
  ([heat-map.md](heat-map.md#the-cell-cap)).

The draft → apply → URL flow is drawn in [url-state.md](url-state.md#a-filter-change-sidebar).
Auto-apply ([`useAutoApply`](../src/hooks/filters/useAutoApply.ts)) commits the sidebar's draft
after 200 ms unchanged, when the setting is on and Apply isn't blocked. The sheet writes through
`useFiltersSheet`, which closes it before navigating ([url-state.md](url-state.md#why-sheets-close-before-navigating)).

## Adding a filter

1. **Key and type:** an `EFilterKey` member (also the field name) and the `TFilters` field.
2. **Config:** its param in `SIDEBAR_PARAMS`, default in `FILTER_DEFAULTS`, entry in
   `FILTERS_CONFIG`, place in `FILTER_ORDER`.
3. **Codec:** `parse` (null for absent or invalid) and `encode` in `FILTER_CODECS`; extend
   `normalizeFilters` if other filters constrain it.
4. **Section:** a component taking `TFilterSectionRenderProps`, wrapped in `FilterSection`, mapped
   in `FILTER_SECTION_COMPONENTS`; reuse UI primitives.
5. **Chip:** its short form in `CHIP_FORMATTERS`.
6. **Text:** its title and `filters.names.<key>` in all 10 locales.
7. **Use:** read it with `useFilters()` where it matters.
8. **Tests:** codec round-trip and canonical form, availability, and an e2e check that the URL
   changes.
