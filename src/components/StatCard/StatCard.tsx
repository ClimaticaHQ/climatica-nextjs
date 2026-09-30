import { Card } from "@/components/Card";
import { DATA_UPDATE_ALL_SERIES } from "@/constants";
import { ECardPadding, ECardSize, EStatValueSize } from "@/enums";
import { STAT_CARD_CLASSES as C, STAT_VALUE_CLASSES } from "./StatCard.constant";
import type { TStatCardProps } from "./StatCard.type";

/**
 * A small card with one value: a label, the value (with its unit) and an optional line under it.
 * Its value comes from the page's data, so it flashes when that data updates.
 */
export function StatCard({
  label,
  value,
  unit,
  sub,
  valueColor,
  valueSize = EStatValueSize.XL,
  flashKeys = DATA_UPDATE_ALL_SERIES,
}: TStatCardProps) {
  return (
    <Card
      data-stat-card
      size={ECardSize.MD}
      padding={ECardPadding.COMPACT}
      flashKeys={flashKeys}
      className={C.CARD}
    >
      <span className={C.LABEL}>{label}</span>
      <span
        className={STAT_VALUE_CLASSES[valueSize]}
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
        {unit && <span className={C.UNIT}>{unit}</span>}
      </span>
      {sub && <span className={C.SUB}>{sub}</span>}
    </Card>
  );
}
