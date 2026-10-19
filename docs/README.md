# Climatica developer documentation

Climatica shows WorldClim's monthly climate and weather data for any place: one city's chart,
two cities or periods compared, and a region's heat map. These documents explain how the app is
built, so a developer can find their way around it and change it. Each one points to the source
files it describes; the code is the reference for exact values.

## Reading order

If you're new to the project, read in this order:

1. [architecture.md](architecture.md) — the overview.
2. [backend.md](backend.md) — where the data comes from.
3. [url-state.md](url-state.md) — how a page knows what to show.
4. [pages.md](pages.md) — how a page is put together.
5. [charts.md](charts.md) — how its chart is drawn.
6. [climate-indices.md](climate-indices.md) — what the diagram and the numbers mean.
7. The rest as you need them: [filters.md](filters.md), [heat-map.md](heat-map.md),
   [export.md](export.md), [colors.md](colors.md), [settings.md](settings.md),
   [localization-i18n.md](localization-i18n.md), [testing.md](testing.md), [operations.md](operations.md).

To get the app running first, start with [operations.md](operations.md#first-time-setup).

## The documents

**[architecture.md](architecture.md)** — The folder structure, the data flow from a component to
WorldClim and back (with the full path from a city search to its chart), the page pattern in
brief, where each kind of state lives, and where shared UI components are.

**[backend.md](backend.md)** — The API route handlers: city search through Solr and Wikidata,
the WorldClim proxy and its row limits, how heat map regions are split into strips, Redis
caching and rate limiting, and how upstream errors reach the page.

**[url-state.md](url-state.md)** — The URL as the source of truth: which hooks may write it,
push versus replace, canonical and legacy params, the navbar's last-page-params cache, the
step-by-step flows of a page load, a filter change and Back, the data hooks' query keys, and a
reference of every param.

**[pages.md](pages.md)** — The three layers of a page (page hook, model, view), the four pages
and what differs between them, `PageLayout`'s regions and spacing, data states and errors, the
shared page hooks, and how to add a block to every page or a new chart page.

**[charts.md](charts.md)** — Series and their kind rules, the chart model, view state and
features, the chart section and card, the standard chart, overlay and side by side, expanded
panels, hover sync, tooltips, the monthly values table, the chart block registry, exports and
data updates.

**[climate-indices.md](climate-indices.md)** — The Walter-Lieth diagram: its scale and
precipitation compression, the arid, humid and perhumid regimes and their crossings, the frost
band, and when the diagram is drawn. The derived values — mean temperature, arid and frost
months, the De Martonne index and its classes — with their formulas.

**[filters.md](filters.md)** — `FILTERS_CONFIG`, availability (hidden, disabled with a reason),
the filter components and their three containers, the draft and auto-apply, and how to add a
filter.

**[heat-map.md](heat-map.md)** — The Region Heatmap page: drawing a box or polygon, grid sizes
and the cell cap, strip requests, colour scales, the region's statistics and climate profile.

**[export.md](export.md)** — The export menu on each page, how an SVG is built from the chart
model, the export palette and token resolution, PNG rendering, raw data, and the heat map image
with its basemap tiles and attribution.

**[colors.md](colors.md)** — The colour layers (primitives, semantic tokens), series line and
bar colours, badges and tint sets, chart variables, contrast rules and their tests, the dark
theme, and how to add a colour.

**[settings.md](settings.md)** — What is stored in the URL, localStorage and the cookie; the
settings store and its migration; the theme, the animations setting and reduced motion; the
settings page; and how to add a setting.

**[localization-i18n.md](localization-i18n.md)** — The ten locales, how the locale is chosen (cookie, then
`Accept-Language`), using translations, key conventions, and how to add a language, Solr index
included.

**[testing.md](testing.md)** — Vitest and Playwright setup, conventions for component, chart,
page, route and end-to-end tests, mobile scenarios, and the Python suite.

**[operations.md](operations.md)** — Running locally: Docker services, environment variables,
first-time setup, the Solr reindex, updating an environment, the npm scripts, and how CI tests
and deploys `main`.
