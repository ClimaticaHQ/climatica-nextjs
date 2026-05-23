import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGE_CODES } from "@/constants";

export function resolveLanguageCode(language: string | undefined) {
  const normalized = language?.toLowerCase();
  if (!normalized) return DEFAULT_LANGUAGE;

  if (SUPPORTED_LANGUAGE_CODES.has(normalized)) {
    return normalized;
  }

  const baseCode = normalized.split("-")[0];
  return SUPPORTED_LANGUAGE_CODES.has(baseCode) ? baseCode : DEFAULT_LANGUAGE;
}
