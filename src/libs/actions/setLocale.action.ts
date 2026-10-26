"use server";

import { LOCALE_COOKIE } from "@/constants";
import { parseLocale } from "@/utils/locale.util";
import { cookies } from "next/headers";

/** Saves the visitor's language; the next render of every page uses it. */
export async function setLocale(locale: string) {
  (await cookies()).set(LOCALE_COOKIE.NAME, parseLocale(locale), {
    path: LOCALE_COOKIE.PATH,
    maxAge: LOCALE_COOKIE.MAX_AGE_SECONDS,
    sameSite: LOCALE_COOKIE.SAME_SITE,
  });
}
