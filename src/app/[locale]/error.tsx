"use client";

import { Button } from "@/components/UI";
import { EButtonVariant } from "@/enums";
import { Link } from "@/libs/I18nNavigation";
import { logger } from "@/libs/Logger";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

type TErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const secondaryLinkClass =
  "rounded-[var(--radius-sm)] font-medium transition-colors duration-150 px-6 py-2 text-[length:var(--font-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]";

export default function ErrorPage({ error, reset }: TErrorPageProps) {
  const t = useTranslations();

  useEffect(() => {
    logger.error(`[App] Runtime error: ${error.message}`);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 bg-[var(--color-bg)] text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-16 h-16 text-[var(--color-primary)] opacity-80"
        aria-hidden="true"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>

      <div className="flex flex-col gap-2">
        <h1 className="text-[length:var(--font-2xl)] font-bold text-[var(--color-text)]">
          {t("error.title")}
        </h1>
        <p className="text-[var(--color-text-secondary)] max-w-sm">{t("error.subtitle")}</p>
        {error.digest && (
          <code className="mt-1 text-[length:var(--font-xs)] text-[var(--color-text-secondary)] opacity-50 font-mono">
            {error.digest}
          </code>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          variant={EButtonVariant.PRIMARY}
          onClick={reset}
          className="px-6 py-2 text-[length:var(--font-sm)]"
        >
          {t("error.tryAgain")}
        </Button>
        <Link href="/" className={secondaryLinkClass}>
          {t("error.goHome")}
        </Link>
      </div>
    </div>
  );
}
