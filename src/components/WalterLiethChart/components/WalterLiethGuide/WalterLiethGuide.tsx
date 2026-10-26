import { InfoIcon } from "@/components/svg";
import { Popover } from "@/components/UI/Popover";
import { useTranslations } from "next-intl";
import {
  WALTER_LIETH_GUIDE_CLASSES as C,
  WALTER_LIETH_GUIDE_ITEMS,
} from "./WalterLiethGuide.constant";

/** "How to read this diagram": the WL conventions in a small popover. */
export function WalterLiethGuide() {
  const t = useTranslations();
  const title = t("chart.wlGuideButton");

  return (
    <Popover
      label={title}
      trigger={
        <>
          <InfoIcon />
          {title}
        </>
      }
    >
      <ul className={C.LIST}>
        {WALTER_LIETH_GUIDE_ITEMS.map((key) => (
          <li key={key}>{t(`chart.wlGuide.${key}`)}</li>
        ))}
      </ul>
    </Popover>
  );
}
