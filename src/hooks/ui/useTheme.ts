"use client";

import { LOCAL_STORAGE_KEYS } from "@/constants";
import { useEffect, useState } from "react";

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, "light");
    }
  }

  return { isDark, toggleTheme };
}
