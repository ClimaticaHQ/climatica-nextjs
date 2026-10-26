import { Badge } from "@/components/UI/Badge";
import { useFormatNumber } from "@/hooks/ui/useFormatNumber";
import { getCellCountStatus } from "@/utils/cellCount.util";
import { useTranslations } from "next-intl";
import type { TCellCountBadgeProps } from "./filters.type";

/** How many heat map cells a region loads and how fast: past the cap, a "Too many cells" warning. */
export function CellCountBadge({ count }: TCellCountBadgeProps) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  const status = getCellCountStatus(count);

  return (
    <Badge tone={status.tone}>
      {t(status.labelKey)}
      <span className="opacity-70">
        {t("sidebar.cellCount.label", { count: formatNumber(count, { hasGrouping: true }) })}
      </span>
    </Badge>
  );
}
