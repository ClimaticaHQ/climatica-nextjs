# Settings and persistence

What the app remembers about a reader and where it keeps it: the URL, localStorage and one
cookie. Then the settings themselves: the store, the theme, the animations and the settings
page. The URL's own rules are in [url-state.md](url-state.md); the language in
[localization-i18n.md](localization-i18n.md).

## What is stored where

| Where                         | What                                                                                                           | Written by                                                               | Read by                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| URL                           | filters and page view state (city, chart mode, layout, shading, expanded panel, pair, shown years, the region) | the URL hooks ([url-state.md](url-state.md))                             | every page; the source of truth                                             |
| `climatica:settings`          | every preference but the language, one versioned object                                                        | [`settingsStore`](../src/stores/settingsStore.ts)                        | the store, and the inline theme script before the first paint               |
| `climatica:lastSelectedCity`  | City Climate's and Compare Periods' city                                                                       | [`persistedLocationStores`](../src/stores/persistedLocationStores.ts)    | the pages, when the URL names no city                                       |
| `climatica:compareCityA`, `B` | Compare Cities' two cities                                                                                     | `persistedLocationStores`                                                | Compare Cities, when the URL names none                                     |
| `climatica:lastPageParams`    | each page's own params, last seen                                                                              | [`useLastPageParamsSync`](../src/hooks/url/useLastPageParamsSync.ts)     | the navbar links, at click time only                                        |
| `NEXT_LOCALE` cookie          | the language, for a year                                                                                       | [`setLocale`](../src/libs/actions/setLocale.action.ts) (a server action) | the server, on every request ([localization-i18n.md](localization-i18n.md)) |
| memory only                   | fetched data (TanStack Query), an in-flight link navigation (`navigationIntentStore`), UI state                | —                                                                        | —                                                                           |

The keys are in [`localStorageKeys.constant.ts`](../src/constants/localStorageKeys.constant.ts).
The app uses no sessionStorage and no other cookie.

Why this split: a shared link must open exactly what its sender saw, so everything that
decides what a page shows is in the URL. localStorage only fills what a URL leaves out (the
last city), or serves as a cache (the navbar's params), never overriding the URL. The language
is a cookie rather than localStorage because the server renders the page in it, so it must
reach the server with the request.

## The settings store

The reader's preferences are one persisted Zustand store,
[`settingsStore`](../src/stores/settingsStore.ts), under the single localStorage key
`climatica:settings`. Defaults are `SETTINGS_DEFAULTS` in
[`settings.constant.ts`](../src/constants/settings.constant.ts):

| Setting              | Default | Effect                                                                                                                                                          |
| -------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme`              | system  | light, dark or the device's (below)                                                                                                                             |
| `animationsEnabled`  | on      | every transition and animation (below)                                                                                                                          |
| `updateFlashVariant` | glow    | how a card marks new data: a green border with a glow, or the border only ([`Card`](../src/components/Card/Card.tsx), [charts.md](charts.md#data-updates))      |
| `autoApplyFilters`   | on      | the sidebar applies a filter 200 ms after the last change; off, it waits for Apply ([filters.md](filters.md#draft-and-auto-apply))                              |
| `syncCity`           | on      | a city picked on one page opens on the others (`CITY_SLOT_RULES`, [`useCitySelection`](../src/hooks/pages/useCitySelection.ts)); the heat map's map flies to it |
| `autoScroll`         | off     | after a picked city's data shows, scroll to the results ([`useScrollToResults`](../src/hooks/pages/useScrollToResults.ts))                                      |

The language is not in it: it's the `NEXT_LOCALE` cookie the server reads ([localization-i18n.md](localization-i18n.md)).

- **Version and migration.** The store is at version 1. Its `migrate`
  ([`migrateSettings`](../src/utils/settings.util.ts)) takes a version 0 `climatica:settings`
  and the theme from the old `climatica:theme` or `theme` key; a saved choice migrates as it is.
  Invalid or missing values fall back to the defaults (`mergePersistedSettings`). Once the store
  has hydrated, [`useLegacyStorageCleanup`](../src/hooks/persisted/useLegacyStorageCleanup.ts)
  removes the old keys (`LEGACY_STORAGE_KEYS`, including the dead `climatica:lang`, and the
  filters and heat map box older versions kept before the URL held them).
- **Hydration.** Code that acts on a setting at load (the city sync) waits for `hasHydrated`,
  so a default never acts before the saved value has been read.

## Theme

An inline script in the root layout's `<head>`
([`THEME_INIT_SCRIPT`](../src/constants/theme.constant.ts)) reads the saved theme (falling back
to the old keys, then system) and sets the `dark` class before the first paint, so there's no
flash. After that, [`ThemeRoot`](../src/components/ThemeRoot/ThemeRoot.tsx)
([`useThemeSync`](../src/hooks/ui/useThemeSync.ts)) keeps the class in step with the store,
and with `prefers-color-scheme` while the theme is system. Every colour token is remapped under
`html.dark` ([colors.md](colors.md#dark-theme)).

## Animations

Motion runs only while the Animations setting is on and the device doesn't ask for reduced
motion ([`useMotionPreference`](../src/hooks/ui/useMotionPreference.ts), `isMotionEnabled`).

- **CSS motion.** [`MotionRoot`](../src/components/MotionRoot/MotionRoot.tsx), mounted once in
  `AppLayout`, sets `data-motion="off"` on `<html>` while motion is off. One rule in
  [`animations.css`](../src/styles/animations.css) then switches off every CSS transition and
  animation, and a second does the same under `prefers-reduced-motion` even before the app
  has run. A new transition is therefore covered without extra code.
- **JS motion.** The update flash ([`useUpdateFlash`](../src/components/DataUpdate/hooks/useUpdateFlash.ts)),
  the chart card's crossfade ([`ChartTransition`](../src/components/ChartTransition/ChartTransition.tsx))
  and Recharts' series animations ([`useSeriesToggleMotion`](../src/hooks/charts/useSeriesToggleMotion.ts))
  check `isMotionEnabled` themselves.
- **Timing.** Every duration and easing is in `MOTION`
  ([`motion.constant.ts`](../src/constants/motion.constant.ts)), passed to CSS as `--motion-*`
  custom properties on `<html>` by the root layout.

## Settings page

`/settings` ([`useSettingsPage`](../src/hooks/pages/useSettingsPage.ts),
[`src/app/settings/_components/`](../src/app/settings/_components)) has three groups: Language,
Appearance (theme, animations, update highlight) and Charts and filters (auto-apply, sync city,
auto-scroll). It writes the store directly, so a change applies at once.

A setting that needs another one on is nested under it (`SettingsDependentRows`) and stays
visible but disabled while that one is off, with a hint in place of its description
(`SettingsRow`'s `isDisabled` and `disabledHint`). Update highlight depends on Animations, and
both are disabled while the device asks for reduced motion (followed live).

It has no filters: the sidebar and the mobile filter bar show only on filter pages. It's opened
from the topbar's gear (desktop) and the menu's Settings item (mobile); the link carries the
shared filters, and Back returns to the previous page's URL. The language dropdown saves the
cookie and re-renders the same page in the new language (`useLocaleSwitch`,
[localization-i18n.md](localization-i18n.md#choosing-the-locale)).

## Adding a setting

1. Add the field to `TSettings` ([`settingsStore.type.ts`](../src/types/stores/settingsStore.type.ts))
   and its default to `SETTINGS_DEFAULTS`. A saved object without it gets the default
   (`mergePersistedSettings`), so no version bump is needed; bump `SETTINGS_STORE_VERSION`
   and extend `migrateSettings` only when a saved value's meaning changes.
2. Save it in `getPersistedSettings` and validate it in `mergePersistedSettings`
   ([`settings.util.ts`](../src/utils/settings.util.ts)), so a stale or hand-edited entry can't
   put an invalid value in the store.
3. Add its row to the settings page's group (`BEHAVIOUR_SETTINGS` in
   [`Settings.constant.ts`](../src/app/settings/_components/Settings.constant.ts) for a
   charts-and-filters switch).
4. Read it with `useSettingsStore` where it acts, and wait for `hasHydrated` if it acts on load.
5. Texts in all 10 locales ([localization-i18n.md](localization-i18n.md)); tests beside
   [`settingsStore.test.ts`](../tests/unit/stores/settingsStore.test.ts).
