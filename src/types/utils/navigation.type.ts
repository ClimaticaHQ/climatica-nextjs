import type { useRouter } from "@/libs/I18nNavigation";

export type TAppRouter = ReturnType<typeof useRouter>;

/** Structurally matches createUrlParamHelpers's return shape (urlParams.util.ts). */
export type TUrlParamHelpers = {
  set: (key: string, val: string) => void;
  delete: (key: string) => void;
  changed: boolean;
  params: URLSearchParams;
};
