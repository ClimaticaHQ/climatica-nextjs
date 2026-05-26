"use client";

import { Dropdown } from "@/components/UI";
import { LANGUAGES } from "@/constants";
import { usePathname, useRouter } from "@/libs/I18nNavigation";
import { parseLocale } from "@/libs/I18nRouting";
import { useLocale } from "next-intl";
import type { TLanguageSwitcherProps } from "./LanguageSwitcher.type";

export function LanguageSwitcher({ variant = "dropdown" }: TLanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function change(code: string) {
    router.push(pathname, { locale: parseLocale(code), scroll: false });
  }

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap gap-2 px-4 py-2">
        {LANGUAGES.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => change(code)}
            className={`
              px-3 py-1.5 rounded-[var(--radius-sm)]
              text-[length:var(--font-sm)] transition-colors duration-150
              ${
                locale === code
                  ? "bg-[var(--color-primary)] text-[var(--color-bg)] font-medium"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
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
      options={LANGUAGES.map(({ code, label }) => ({ value: code, label }))}
      value={locale}
      onChange={change}
    />
  );
}
