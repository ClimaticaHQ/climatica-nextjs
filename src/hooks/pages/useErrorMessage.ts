import { getErrorMessageKey } from "@/utils";
import { useTranslations } from "next-intl";

export function useErrorMessage() {
  const t = useTranslations();
  return (error: unknown, fallbackKey?: string) => t(getErrorMessageKey(error, fallbackKey));
}
