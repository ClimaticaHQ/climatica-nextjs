"use client";

import { Chip, Dropdown } from "@/components/UI";
import { LANGUAGE_SWITCHER_VARIANTS, LANGUAGES } from "@/constants";
import { useLocaleNavigation } from "@/hooks/url/useLocaleNavigation";
import { useLocale } from "next-intl";
import { LANGUAGE_CHIP_GRID_CLASS } from "./LanguageSwitcher.constant";
import type { TLanguageSwitcherProps } from "./LanguageSwitcher.type";

export function LanguageSwitcher({
  variant = LANGUAGE_SWITCHER_VARIANTS.DROPDOWN,
}: TLanguageSwitcherProps) {
  const locale = useLocale();
  const { switchLocale } = useLocaleNavigation();

  if (variant === LANGUAGE_SWITCHER_VARIANTS.INLINE) {
    return (
      <div className={LANGUAGE_CHIP_GRID_CLASS}>
        {LANGUAGES.map(({ code, label }) => (
          <Chip
            key={code}
            label={label}
            isActive={locale === code}
            isStretched
            onClick={() => switchLocale(code)}
          />
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
