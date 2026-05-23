import { Dropdown } from "@/components/UI";
import { LANGUAGES, LOCAL_STORAGE_KEYS } from "@/constants";
import i18next from "i18next";
import { useEffect, useState } from "react";
import { TLanguageSwitcherProps } from "./LanguageSwitcher.type";
import { resolveLanguageCode } from "./LanguageSwitcher.util";

export default function LanguageSwitcher({ variant = "dropdown" }: TLanguageSwitcherProps) {
  const [current, setCurrent] = useState(
    resolveLanguageCode(i18next.resolvedLanguage ?? i18next.language),
  );

  const change = async (code: string) => {
    await i18next.changeLanguage(code);
    localStorage.setItem(LOCAL_STORAGE_KEYS.LANGUAGE, code);
  };

  useEffect(() => {
    const handleLanguageChanged = (language: string) => {
      setCurrent(resolveLanguageCode(language));
    };

    i18next.on("languageChanged", handleLanguageChanged);

    return () => {
      i18next.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap gap-2 px-4 py-2">
        {LANGUAGES.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => {
              void change(code);
            }}
            className={`
              px-3 py-1.5 rounded-[var(--radius-sm)]
              text-[length:var(--font-sm)] transition-colors duration-150
              ${
                current === code
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
      value={current}
      onChange={(code) => {
        void change(code);
      }}
    />
  );
}
