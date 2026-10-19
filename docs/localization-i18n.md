# Localization

The app is translated into 10 languages with [next-intl](https://next-intl.dev). The list of
languages lives in one file and drives the app and the city search index.

## Locales

[`src/configs/locales.json`](../src/configs/locales.json) is the single list of locale codes
(`de`, `el`, `en`, `es`, `fr`, `it`, `nb`, `pt`, `ro`, `uk`). Everything else reads it:

- [`LOCALES`](../src/constants/locales.constant.ts) in the app, and through it the locale
  resolution, the language dropdown on the settings page and the Solr query builder.
- [`generate_schema.py`](../docker/solr/scripts/generate_schema.py), which writes a
  `label_<lang>` and `label_<lang>_ngram` field per locale into `docker/solr/schema.json`.
- [`prepare_data.py`](../docker/solr/scripts/prepare_data.py), which writes a
  `label_<lang>` column per locale into the cities CSV, from GeoNames' alternate names.

The language dropdown shows each language by its own name (`Українська`, `Español`), from
`LANGUAGE_NATIVE_NAMES` in [`language.constant.ts`](../src/constants/language.constant.ts); a
locale without an entry shows its code in capitals.

## Choosing the locale

The language is a user preference, not part of the URL: every route has one path
(`/heat-map`) whatever the language.

- [`I18n.ts`](../src/libs/I18n.ts) is next-intl's request config, without locale routing:
  [`resolveRequestLocale`](../src/utils/locale.util.ts) takes the `NEXT_LOCALE` cookie if it
  names a supported locale, else the best supported match in `Accept-Language` (by q weight,
  then order; `nn` and `no` map to `nb`), else English. It then loads
  `src/i18n/locales/<locale>.json`. [`next.config.ts`](../next.config.ts) points the plugin at
  it. The server renders in that locale, so there's no flash.
- The settings page's language dropdown calls
  [`useLocaleSwitch`](../src/hooks/url/useLocaleSwitch.ts): the server action
  [`setLocale`](../src/libs/actions/setLocale.action.ts) writes the cookie
  ([`LOCALE_COOKIE`](../src/constants/locales.constant.ts): a year, path `/`, `SameSite=Lax`),
  then `router.refresh()` re-renders the same page in the new language.
- [`src/proxy.ts`](../src/proxy.ts) redirects old links with a locale prefix (`/es/heat-map?…`)
  with a 308 to the same path and query without it (`stripLocalePrefix`). It doesn't touch the
  cookie: the reader's own language applies.
- Links and navigation use `next/link` and `next/navigation` directly.

### SEO

Every page's canonical URL has no prefix (`alternates.canonical`, from
[`buildCanonicalPath`](../src/utils/metadata.util.ts)) and there's no hreflang. A crawler sends
no cookie and usually no `Accept-Language`, so it indexes the English pages. Next.js sets its
own `Vary` on rendered pages and overwrites any other value, so `Vary: Cookie, Accept-Language`
can't be set from the app. It isn't needed for correctness: every page is
rendered per request and sent with `Cache-Control: private, no-cache, no-store`, so no shared
cache stores one language's page for another reader.

## Using translations

- Client components: `const t = useTranslations();` then `t("pages.heatMap.title")`.
- Server code and metadata: `getLocale()` and `getTranslations({ locale, namespace })`, as in
  [`metadata.util.ts`](../src/utils/metadata.util.ts).
- Values use ICU message syntax: placeholders (`"Weather {year}"`) and plurals
  (`"{count, plural, one {# changed} other {# changed}}"`).
- Code that needs a translator outside React takes a `TTranslate` function (e.g.
  [`filterChips.util.ts`](../src/utils/filterChips.util.ts)), so tests can pass a stub.

## Key conventions

- Keys are grouped by namespace: `pages` (each page's title and description, also the
  navbar labels), `sidebar` and `filters` (filter UI), `settings` (the settings page), `chart`, `meta` (page metadata),
  `months`, `units`, `errors` and others. See the top level of
  [`en.json`](../src/i18n/locales/en.json).
- Every locale file has the same keys. A change to keys updates all 10 files in the same
  change, with natural phrasing in each language; keys that become unused are removed.
- Never hard-code user-facing text.
- [`localeParity.test.ts`](../tests/unit/utils/localeParity.test.ts) (`npm run test`)
  checks every file in `src/i18n/locales/`: one file per locale in `locales.json`, every
  message a string, exactly the keys of `en.json` (it lists the missing and extra ones), and
  the same placeholder names (`{city}`, `{count, plural, …}`) as `en.json`. A new locale
  file is picked up without changing the test.

## How to add a new language

Use the ISO 639-1 code GeoNames uses for the language's alternate names (e.g. `pl`).

1. **Add the code** to [`src/configs/locales.json`](../src/configs/locales.json), keeping
   alphabetical order. The CSV columns follow this order.
2. **Add the messages:** copy [`en.json`](../src/i18n/locales/en.json) to
   `src/i18n/locales/<code>.json` and translate every value. Keep the keys and placeholders
   unchanged.
3. **Add the language's own name** to `LANGUAGE_NATIVE_NAMES` in
   [`language.constant.ts`](../src/constants/language.constant.ts) (e.g. `pl: "Polski"`).
4. **Regenerate the Solr schema:**
   ```bash
   python3 docker/solr/scripts/generate_schema.py
   git diff docker/solr/schema.json   # should only add label_<code> and label_<code>_ngram
   ```
   `schema.json` is committed; don't edit its per-language fields by hand.
5. **Regenerate the cities CSV** (needs the GeoNames files in `docker/solr/data/`, see
   [operations.md](operations.md)):
   ```bash
   python3 docker/solr/scripts/prepare_data.py
   ```
6. **Apply the schema and reimport the cities:**
   ```bash
   npm run solr:reindex
   ```
   `solrconfig.xml` needs no change: the app sends its own `qf` and `pf` for every locale in
   `locales.json` ([`buildSolrQueryParams`](../src/utils/solr.util.ts)).
7. **Check it:** run `npm run test` (the parity test fails on a missing or extra key), run the app, pick the new language in Settings, and search a city whose name has
   a translation in it. Run the Python tests (`npm run test:python`) if you changed
   `prepare_data.py`.

Other developers then update their environment as described in
[operations.md](operations.md).
