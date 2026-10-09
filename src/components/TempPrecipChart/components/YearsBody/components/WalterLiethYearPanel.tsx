import { Card } from "@/components/Card";
import { WalterLiethChart } from "@/components/WalterLiethChart";
import { WalterLiethIncompleteNotice } from "@/components/WalterLiethChart/components";
import { ECardPadding, ECardSize } from "@/enums";
import { isCompleteSeries } from "@/utils";
import { YEARS_BODY_CLASSES as C } from "../YearsBody.constant";
import type { TWalterLiethYearPanelProps } from "../YearsBody.type";

/** One weather year's diagram in its panel card — or the notice when months are missing. */
export function WalterLiethYearPanel({
  series,
  domain,
  syncId,
  activeMonth,
  name,
}: TWalterLiethYearPanelProps) {
  if (!isCompleteSeries(series)) {
    return (
      <div className={C.INCOMPLETE}>
        <WalterLiethIncompleteNotice label={series.label} />
      </div>
    );
  }
  return (
    <Card size={ECardSize.SM} padding={ECardPadding.PANEL} className={C.PANEL}>
      <WalterLiethChart
        series={series}
        domain={domain}
        syncId={syncId}
        isCompact
        isPanel
        showLegend={false}
        headerSlots={name === undefined ? {} : { name }}
        activeMonthIndex={activeMonth.activeMonthIndex}
        onActiveMonthIndexChange={activeMonth.onActiveMonthIndexChange}
      />
    </Card>
  );
}
