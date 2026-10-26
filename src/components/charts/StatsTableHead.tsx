import { SeriesMarker } from "@/components/SeriesMarker";
import { InfoIcon, SortArrowIcon } from "@/components/svg";
import { Popover } from "@/components/UI/Popover";
import { ARRIVAL_FLASH_ATTRIBUTE, DIFFERENCE_NOTE_KEYS } from "@/constants";
import { EPopoverVariant, ESortOrder } from "@/enums";
import { useIsTruncated } from "@/hooks/ui/useIsTruncated";
import { useTranslations } from "next-intl";
import { STATS_TABLE_CLASSES as C } from "./charts.constant";
import type { TSeriesHeadLabelProps, TSortButtonProps, TStatsTableHeadProps } from "./charts.type";

const SORT_LABEL_KEYS = {
  [ESortOrder.ASC]: "comparePeriods.sort.ascending",
  [ESortOrder.DESC]: "comparePeriods.sort.descending",
} as const satisfies Record<ESortOrder, string>;

/** The corner's sort toggle: "Year" and its direction, flipping the whole page's order. */
function SortButton({ sort }: TSortButtonProps) {
  const t = useTranslations();
  const isDescending = sort.order === ESortOrder.DESC;
  return (
    <button
      type="button"
      data-sort-order={sort.order}
      aria-label={t(SORT_LABEL_KEYS[sort.order])}
      onClick={sort.onToggle}
      className={C.SORT_BUTTON}
    >
      {t("comparePeriods.sort.year")}
      <SortArrowIcon isDescending={isDescending} />
    </button>
  );
}

/** A series' name on one line; only when it's clipped it opens its full name. */
function SeriesHeadLabel({ label }: TSeriesHeadLabelProps) {
  const { ref, isTruncated } = useIsTruncated<HTMLSpanElement>(label);
  const text = (
    <span ref={ref} className={C.SERIES_LABEL}>
      {label}
    </span>
  );
  if (!isTruncated) return text;

  return (
    <Popover variant={EPopoverVariant.TEXT} label={label} trigger={text}>
      {label}
    </Popover>
  );
}

/** The stats table's header row: the metric, each series by name, and a pair's difference. */
export function StatsTableHead({ table, columns, differenceMeaning, sort }: TStatsTableHeadProps) {
  const t = useTranslations();
  const { difference } = table;

  return (
    <thead>
      <tr className={C.HEAD_ROW}>
        <th scope="col" className={C.METRIC_HEAD}>
          {sort ? (
            <SortButton sort={sort} />
          ) : (
            <span className={C.CAPTION}>{t("climateComparison.metric")}</span>
          )}
        </th>
        {table.columns.map(({ id, label }, index) => (
          <th key={id} scope="col" className={C.HEAD_CELL} {...{ [ARRIVAL_FLASH_ATTRIBUTE]: id }}>
            <div className={C.SERIES_NAME}>
              {columns[index] && <SeriesMarker {...columns[index].marker} />}
              <SeriesHeadLabel label={label} />
            </div>
          </th>
        ))}
        {difference && (
          <th scope="col" className={`${C.HEAD_CELL} ${C.DIFFERENCE}`}>
            <div className={C.DIFFERENCE_HEAD}>
              {t("climateComparison.difference")}
              {differenceMeaning && (
                <Popover
                  variant={EPopoverVariant.ICON}
                  label={t("climateComparison.differenceInfo")}
                  trigger={<InfoIcon />}
                >
                  {t(DIFFERENCE_NOTE_KEYS[differenceMeaning], {
                    a: difference.subtrahend,
                    b: difference.minuend,
                  })}
                </Popover>
              )}
            </div>
          </th>
        )}
      </tr>
    </thead>
  );
}
