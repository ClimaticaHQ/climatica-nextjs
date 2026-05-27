import { Link } from "@/libs/I18nNavigation";
import { getTranslations } from "next-intl/server";

const primaryLinkClass =
  "rounded-[var(--radius-sm)] font-medium transition-colors duration-150 px-6 py-2 text-[length:var(--font-sm)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-dark)]";

export default async function NotFoundPage() {
  const t = await getTranslations("notFound");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 bg-[var(--color-bg)] text-center">
      <h1 className="relative flex items-center justify-center">
        <span className="text-[120px] font-bold text-[var(--color-primary)] opacity-10 leading-none select-none">
          404
        </span>
        <span className="absolute text-[length:var(--font-2xl)] font-bold text-[var(--color-primary)]">
          {t("title")}
        </span>
      </h1>

      <p className="text-[var(--color-text-secondary)] max-w-sm">{t("subtitle")}</p>

      <div data-testid="not-found-home-link">
        <Link href="/" className={primaryLinkClass}>
          {t("goHome")}
        </Link>
      </div>
    </div>
  );
}
