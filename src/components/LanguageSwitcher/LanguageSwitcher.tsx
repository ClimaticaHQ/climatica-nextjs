"use client";

import { Dropdown } from "@/components/UI";
import { LANGUAGES } from "@/constants";
import { useLocaleNavigation } from "@/hooks/url/useLocaleNavigation";
import { useLocale } from "next-intl";
import type { TLanguageSwitcherProps } from "./LanguageSwitcher.type";

export function LanguageSwitcher({ variant = "dropdown" }: TLanguageSwitcherProps) {
  const locale = useLocale();
  const { switchLocale } = useLocaleNavigation();

  if (variant === "inline") {
    return (
      <div className="grid grid-cols-4 gap-2 px-4 py-2">
        {LANGUAGES.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => switchLocale(code)}
            className={`
              flex items-center justify-center
              px-3 py-1.5 rounded-[var(--radius-sm)] border
              text-[length:var(--font-sm)] transition-colors duration-150
              ${
                locale === code
                  ? "border-transparent bg-[var(--color-primary)] text-[var(--color-bg)] font-medium"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <Dropdown
      data-testid="language-switcher"
      optionTestIdPrefix="language-option"
      options={LANGUAGES.map(({ code, label }) => ({ value: code, label }))}
      value={locale}
      onChange={switchLocale}
    />
  );
}
