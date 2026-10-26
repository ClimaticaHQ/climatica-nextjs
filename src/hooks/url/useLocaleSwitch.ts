"use client";

import { setLocale } from "@/libs/actions/setLocale.action";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

/**
 * Switching the language: saved as the visitor's (the cookie every request reads), then the
 * current page renders again in it — same URL, nothing navigates.
 */
export function useLocaleSwitch() {
  const router = useRouter();
  const [isSwitching, startTransition] = useTransition();

  function switchLocale(locale: string) {
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  return { switchLocale, isSwitching };
}
