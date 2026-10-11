import { useFormatNumber } from "@/hooks/ui/useFormatNumber";
import { getCellCountStatus } from "@/utils/cellCount.util";
import { useTranslations } from "next-intl";
import { CELL_COUNT_BADGE_CLASS } from "./filters.constant";
import type { TCellCountBadgeProps } from "./filters.type";

/** How many heat map cells a region loads and how fast: past the cap, a "Too many cells" warning. */
export function CellCountBadge({ count }: TCellCountBadgeProps) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  const status = getCellCountStatus(count);

  return (
    <span className={`${CELL_COUNT_BADGE_CLASS} ${status.colorClass}`}>
      {t(status.labelKey)}
      <span className="opacity-70">
        {t("sidebar.cellCount.label", { count: formatNumber(count, { hasGrouping: true }) })}
      </span>
    </span>
  );
}
