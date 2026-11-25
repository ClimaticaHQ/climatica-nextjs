import { ETheme } from "@/enums";
import { LEGACY_THEME_STORAGE_KEYS, LOCAL_STORAGE_KEYS } from "./localStorageKeys.constant";

export const PREFERS_DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

/** runs before the first paint, before any bundle, so a dark page never flashes light: plain ES5 in a string */
export const THEME_INIT_SCRIPT = `(function () {
  try {
    var themes = ${JSON.stringify(Object.values(ETheme))};
    var theme = null;
    var saved = localStorage.getItem(${JSON.stringify(LOCAL_STORAGE_KEYS.SETTINGS)});
    if (saved) theme = ((JSON.parse(saved) || {}).state || {}).theme;
    var legacyKeys = ${JSON.stringify(LEGACY_THEME_STORAGE_KEYS)};
    for (var i = 0; themes.indexOf(theme) === -1 && i < legacyKeys.length; i++) {
      theme = localStorage.getItem(legacyKeys[i]);
    }
    if (themes.indexOf(theme) === -1) theme = ${JSON.stringify(ETheme.SYSTEM)};
    var isDark = theme === ${JSON.stringify(ETheme.DARK)} ||
      (theme === ${JSON.stringify(ETheme.SYSTEM)} && window.matchMedia(${JSON.stringify(PREFERS_DARK_MEDIA_QUERY)}).matches);
    document.documentElement.classList.toggle(${JSON.stringify(ETheme.DARK)}, isDark);
  } catch (e) {}
})();`;
