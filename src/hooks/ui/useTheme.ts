"use client";

import { ETheme } from "@/enums";
import { applyTheme, readStoredTheme, storeTheme } from "@/utils/theme.util";
import { useEffect, useState } from "react";

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  // * from storage, not from <html>: this runs before ThemeProvider's effect applies the class
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setIsDark(readStoredTheme() === ETheme.DARK);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function toggleTheme() {
    const next = isDark ? ETheme.LIGHT : ETheme.DARK;
    setIsDark(next === ETheme.DARK);
    applyTheme(next);
    storeTheme(next);
  }

  return { isDark, toggleTheme };
}
