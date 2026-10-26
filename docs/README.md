# Climatica developer documentation

Climatica shows WorldClim's monthly climate and weather data for any place: one city's chart, two
cities or periods compared, a region's heat map. These documents describe how the app works and
where each part lives; the code is the reference for exact values.

New to the project: read the first six in order. To run the app first, see
[operations.md](operations.md#first-time-setup).

| Document                                     | Covers                                                                                          |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [architecture.md](architecture.md)           | folders, the data flow from a city search to its chart, where state lives, shared UI            |
| [backend.md](backend.md)                     | route handlers, rate limiting, Redis caching, the WorldClim proxy and its strips, errors        |
| [url-state.md](url-state.md)                 | the URL as source of truth: writers, canonical params, flows, query keys, every param           |
| [pages.md](pages.md)                         | page hook, model and view; the four pages; `PageLayout`; adding a page                          |
| [charts.md](charts.md)                       | series and markers, sort order, the model, card and bodies, phone and touch, bar styles, blocks |
| [climate-indices.md](climate-indices.md)     | the Walter-Lieth diagram's geometry, the derived values and their formulas                      |
| [filters.md](filters.md)                     | `FILTERS_CONFIG`, availability, components and containers, the draft, adding a filter           |
| [city-search.md](city-search.md)             | the Solr index, analysis, the two query clauses, scoring, limits                                |
| [heat-map.md](heat-map.md)                   | the region, the cell cap, requests, colour scales, statistics                                   |
| [export.md](export.md)                       | the export pipeline, the export palette, the image, raw data, the heat map image                |
| [colors.md](colors.md)                       | colour layers, entities by shape, precipitation bars, contrast, dark theme, the tests           |
| [settings.md](settings.md)                   | what is stored where, the settings store, theme, animations, the settings page                  |
| [localization-i18n.md](localization-i18n.md) | locales, choosing the locale, key conventions, adding a language                                |
| [testing.md](testing.md)                     | Vitest, Playwright and pytest conventions                                                       |
| [operations.md](operations.md)               | Docker, environment, the Solr index, npm scripts, CI and deployment                             |
