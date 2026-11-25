"use client";

import { PageHeader } from "@/components/PageHeader";
import { Badge, Disclosure } from "@/components/UI";
import { INFO_SECTION_IDS as ID, RESOLUTIONS_HELP_HREF } from "@/constants";
import { EBadgeSize, EDisclosureSize, EInfoCardLayout } from "@/enums";
import { useGuidePage } from "@/hooks/pages/useGuidePage";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { WALTER_LIETH_FIGURE } from "../figures/figures.constant";
import { InfoFigure } from "../figures/InfoFigure";
import { LazyWalterLiethFigureChart } from "../figures/LazyFigureCharts";
import {
  COMPARE_LAYOUTS,
  COMPARE_PAGES,
  EXPORT_FORMAT_KEYS,
  FIND_PLACE_WAYS,
  GUIDE_QUESTIONS,
  INFO_CLASSES as C,
  TECH_BADGE_TONE,
} from "../info.constant";
import { InfoCardGrid } from "../parts/InfoCardGrid";
import { InfoList } from "../parts/InfoList";
import { InfoSection } from "../parts/InfoSection";

export function GuidePage() {
  const t = useTranslations();
  const { getHref, settingsHref, stepNumber, scaleValues, questionValues } = useGuidePage();

  return (
    <>
      <PageHeader
        title={t("info.pages.guide.title")}
        description={t("info.pages.guide.description")}
      />
      <div className={C.COLUMN}>
        <InfoSection id={ID.FIND_PLACE} intro={t("info.guide.findPlace.intro")}>
          <InfoCardGrid
            columns={2}
            isOrdered
            layout={EInfoCardLayout.ROW}
            items={FIND_PLACE_WAYS.map((key, index) => ({
              key,
              number: stepNumber(index),
              title: t(`info.guide.findPlace.ways.${key}.title`),
              text: t(`info.guide.findPlace.ways.${key}.text`),
            }))}
          />
        </InfoSection>
        <InfoSection id={ID.WALTER_LIETH} intro={t("info.guide.walterLieth.intro")}>
          <p className={C.TEXT}>{t("info.guide.walterLieth.scale", scaleValues)}</p>
          <InfoFigure
            visual={<LazyWalterLiethFigureChart />}
            annotations={WALTER_LIETH_FIGURE.ANNOTATIONS}
            place={WALTER_LIETH_FIGURE.PLACE}
          />
        </InfoSection>
        <InfoSection id={ID.COMPARE}>
          <InfoCardGrid
            columns={2}
            items={COMPARE_PAGES.map(({ key, route, titleKey }) => ({
              key,
              title: t(titleKey),
              titleHref: getHref(route),
              text: t(`info.guide.compare.${key}`),
            }))}
          />
          <InfoList
            items={COMPARE_LAYOUTS.map(({ key, Icon }) => ({
              key,
              icon: Icon,
              text: t(`info.guide.compare.layouts.${key}`),
            }))}
          />
        </InfoSection>
        <InfoSection id={ID.FILTERS}>
          <p className={C.TEXT}>
            {t("info.guide.filters.sidebar", { apply: t("sidebar.applyFilters") })}
          </p>
          <p className={C.TEXT}>
            {t.rich("info.guide.filters.autoApply", {
              apply: t("sidebar.applyFilters"),
              link: (chunks) => (
                <Link href={settingsHref} className={C.LINK}>
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </InfoSection>
        <InfoSection id={ID.EXPORT} intro={t("info.guide.export.intro")}>
          <ul className={C.CHIPS}>
            {EXPORT_FORMAT_KEYS.map((key) => (
              <li key={key}>
                <Badge tone={TECH_BADGE_TONE} size={EBadgeSize.LG}>
                  {t(`exportMenu.${key}`)}
                </Badge>
              </li>
            ))}
          </ul>
          <p className={C.TEXT}>{t("info.guide.export.share")}</p>
        </InfoSection>
        <InfoSection id={ID.QUESTIONS}>
          <div className={C.PROSE}>
            {GUIDE_QUESTIONS.map((key) => (
              <Disclosure
                key={key}
                size={EDisclosureSize.LG}
                summary={t(`info.guide.questions.${key}.question`, questionValues)}
              >
                <p className={C.TEXT}>
                  {t.rich(`info.guide.questions.${key}.answer`, {
                    ...questionValues,
                    link: (chunks) => (
                      <Link href={RESOLUTIONS_HELP_HREF} className={C.LINK}>
                        {chunks}
                      </Link>
                    ),
                  })}
                </p>
              </Disclosure>
            ))}
          </div>
        </InfoSection>
      </div>
    </>
  );
}
