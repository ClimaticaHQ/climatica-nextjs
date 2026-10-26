# Localization

10 languages with [next-intl](https://next-intl.dev). One list of locales drives the app and the
city search index.

## Locales

[`src/configs/locales.json`](../src/configs/locales.json) is the single list (`de`, `el`, `en`, `es`,
`fr`, `it`, `nb`, `pt`, `ro`, `uk`). It feeds [`LOCALES`](../src/constants/locales.constant.ts)
(locale resolution, the language dropdown, the Solr query), `generate_schema.py` (a `label_<lang>`
field per locale) and `prepare_data.py` (a label column per locale and the search names —
[city-search.md](city-search.md#index)). The dropdown shows each language by its own name
(`LANGUAGE_NATIVE_NAMES`).

## Choosing the locale

The language is a preference, not part of the URL: every route has one path.

1. [`I18n.ts`](../src/libs/I18n.ts) (next-intl's request config, no locale routing) resolves the
   locale ([`resolveRequestLocale`](../src/utils/locale.util.ts)): the `NEXT_LOCALE` cookie if
   supported, else the best `Accept-Language` match (`no` and `nn` → `nb`), else English. The
   server renders in it, so there's no flash.
2. The settings page's dropdown ([`useLocaleSwitch`](../src/hooks/url/useLocaleSwitch.ts)) calls the
   server action [`setLocale`](../src/libs/actions/setLocale.action.ts) (a year-long cookie), then
   `router.refresh()`.
3. [`src/proxy.ts`](../src/proxy.ts) redirects old prefixed links (`/es/heat-map?…`) to the same
   path without the prefix (308), leaving the cookie alone.

**SEO:** canonical URLs have no prefix and there's no hreflang; crawlers send no cookie, so they
index English. `Vary: Cookie, Accept-Language` can't be set (Next.js overwrites `Vary`) and isn't
needed: pages are rendered per request with `Cache-Control: private, no-cache, no-store`.

## Using translations

- Client: `useTranslations()`; server and metadata: `getTranslations({ locale, namespace })`.
- ICU syntax for placeholders and plurals.
- Code outside React takes a `TTranslate` (e.g. [`filterChips.util.ts`](../src/utils/filterChips.util.ts)),
  so tests can pass a real translator.

## Key conventions

- Keys are grouped by namespace (`pages`, `sidebar`, `filters`, `settings`, `chart`, `meta`,
  `months`, `units`, `errors`, …; see [`en.json`](../src/i18n/locales/en.json)).
- Every locale file has the same keys; a key change updates all 10 with natural phrasing, and
  unused keys are removed. No hard-coded user-facing text.
- [`localeParity.test.ts`](../tests/unit/utils/localeParity.test.ts) checks one file per locale,
  string values, exactly `en.json`'s keys, and the same placeholder names.

## Adding a new locale

`src/configs/locales.json` is the single source of truth for supported
locales — the frontend (`src/constants/locales.constant.ts`), the CSV
generator (`prepare_data.py`), and the Solr schema generator
(`generate_schema.py`) all read from it. Adding a language means touching
this one file plus regenerating two derived artifacts:

```bash
# 1. Add the locale code to src/configs/locales.json

# 2. Regenerate the Solr schema (adds the label_<lang> field)
python3 docker/solr/scripts/generate_schema.py

# 3. Regenerate the cities CSV (adds the label_<lang> column)
python3 docker/solr/scripts/prepare_data.py

# 4. Push the new schema to Solr and reimport the data
npm run solr:reindex
```

`schema.json` is committed to the repo but treated as a build artifact of
`generate_schema.py` — don't hand-edit the per-locale fields directly, since
the next regeneration will overwrite them. Run `git diff docker/solr/schema.json`
after step 2 to confirm the change is only additive before reindexing.
