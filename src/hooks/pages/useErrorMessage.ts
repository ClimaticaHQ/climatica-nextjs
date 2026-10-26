import { getErrorMessageKey } from "@/utils";
import { useTranslations } from "next-intl";

/** An error as the reader sees it: the translated message for its cause, never its own text. */
export function useErrorMessage() {
  const t = useTranslations();
  return (error: unknown, fallbackKey?: string) => t(getErrorMessageKey(error, fallbackKey));
}
