import { Badge } from "@/components/UI/Badge";
import { EDisplayMetric } from "@/enums";
import { useDisplayFormat } from "@/hooks/ui/useDisplayFormat";
import { getCellCountStatus } from "@/utils/cellCount.util";
import { useTranslations } from "next-intl";
import type { TCellCountBadgeProps } from "./filters.type";

export function CellCountBadge({ count }: TCellCountBadgeProps) {
  const t = useTranslations();
  const { formatValue } = useDisplayFormat();
  const status = getCellCountStatus(count);

  return (
    <Badge tone={status.tone}>
      {t(status.labelKey)}
      <span className="opacity-70">
        {t("sidebar.cellCount.label", {
          count: formatValue(count, { metric: EDisplayMetric.CELL_COUNT }),
        })}
      </span>
    </Badge>
  );
}
