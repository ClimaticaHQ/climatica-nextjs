"use client";

import { usePathname, useRouter } from "@/libs/I18nNavigation";
import { parseLocale } from "@/libs/I18nRouting";
import { navigateWithIntent } from "@/utils/navigation.util";
import { useSearchParams } from "next/navigation";

/**
 * Switching the language: the same page and every param, under the new locale's prefix. A push,
 * with the navigation intent recorded first, so a pending URL write on the page can't cancel it.
 */
export function useLocaleNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function switchLocale(code: string) {
    navigateWithIntent({
      router,
      pathname,
      query: Object.fromEntries(searchParams.entries()),
      locale: parseLocale(code),
    });
  }

  return { switchLocale };
}
