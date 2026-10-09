import { LEGACY_THEME_STORAGE_KEY, LOCAL_STORAGE_KEYS } from "@/constants";
import { ETheme } from "@/enums";

function isTheme(value: string | null): value is ETheme {
  return Object.values(ETheme).some((theme) => theme === value);
}

// * a theme saved under the old key moves to the current one (unless that's set already)
function migrateLegacyTheme(storage: Storage) {
  const legacy = storage.getItem(LEGACY_THEME_STORAGE_KEY);
  if (legacy === null) return;
  if (storage.getItem(LOCAL_STORAGE_KEYS.THEME) === null && isTheme(legacy)) {
    storage.setItem(LOCAL_STORAGE_KEYS.THEME, legacy);
  }
  storage.removeItem(LEGACY_THEME_STORAGE_KEY);
}

/** The saved theme, or null when none is (or storage is blocked). Call only in the browser. */
export function readStoredTheme(): ETheme | null {
  try {
    migrateLegacyTheme(window.localStorage);
    const theme = window.localStorage.getItem(LOCAL_STORAGE_KEYS.THEME);
    return isTheme(theme) ? theme : null;
  } catch {
    // * storage blocked (private mode, disabled site data) — no saved theme
    return null;
  }
}

export function storeTheme(theme: ETheme) {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme);
  } catch {
    // * storage blocked — the theme still applies, it just isn't remembered
  }
}

/** Shows the theme: dark is the `dark` class on <html>, which global.css keys off. */
export function applyTheme(theme: ETheme) {
  document.documentElement.classList.toggle(ETheme.DARK, theme === ETheme.DARK);
}
