import { useTranslations } from "next-intl";
import type { TWalterLiethIncompleteNoticeProps } from "../WalterLiethChart.type";

/** Shown instead of a diagram when a month lacks temperature or precipitation. */
export function WalterLiethIncompleteNotice({ label }: TWalterLiethIncompleteNoticeProps) {
  const t = useTranslations();
  return (
    <p
      role="status"
      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-6 text-center text-[length:var(--font-sm)] text-[var(--color-text-secondary)]"
    >
      {t("chart.wlIncomplete", { label })}
    </p>
  );
}
