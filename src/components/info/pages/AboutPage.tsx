"use client";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Badge, Button } from "@/components/UI";
import { ExternalLink } from "@/components/UI/ExternalLink";
import {
  INFO_SECTION_IDS as ID,
  INFO_SECTIONS,
  NO_FLASH_KEYS,
  PROJECT_INFO,
  PROPER_NAMES,
  ROUTES,
} from "@/constants";
import { EButtonVariant, EStatLabelSize, EStatValueSize } from "@/enums";
import { useAboutFacts } from "@/hooks/pages/useAboutFacts";
import { useNavbarNavigation } from "@/hooks/url";
import { useTranslations } from "next-intl";
import { HowToCite } from "../parts/HowToCite";
import {
  DATA_SOURCES,
  HOW_IT_WORKS_STEPS,
  INFO_CLASSES as C,
  PRIVACY_POINTS,
  TECH_BADGE_TONE,
  TECH_STACK,
} from "../info.constant";
import { InfoCardGrid } from "../parts/InfoCardGrid";
import { InfoList } from "../parts/InfoList";
import { InfoSection } from "../parts/InfoSection";
import { Team } from "../parts/Team";

/**
 * About: what Climatica is, how its data flows, who makes it, and how to cite it. Sections with
 * no configuration yet (team, citation, SCRAPI's author and docs, links) are left out.
 */
export function AboutPage() {
  const t = useTranslations();
  const { facts, codeFacts } = useAboutFacts();
  const { scrapiAuthor, scrapiDocsUrl, repositoryUrl, changelogUrl } = PROJECT_INFO;
  const { getHref, getPlainHref } = useNavbarNavigation();

  return (
    <>
      <PageHeader
        title={t("info.pages.about.title")}
        description={t("info.pages.about.description")}
      />
      <div className={C.INTRO}>
        <p className={C.LEAD}>{t("info.about.hero.description")}</p>
        <div className={C.HERO_ACTIONS}>
          <Button
            variant={EButtonVariant.PRIMARY}
            href={getHref(ROUTES.CLIMATE_STATISTICS)}
            className={C.HERO_BUTTON}
          >
            {t("info.about.hero.openCityClimate")}
          </Button>
          <Button
            variant={EButtonVariant.SECONDARY}
            href={getPlainHref(ROUTES.ABOUT_GUIDE)}
            className={C.HERO_BUTTON}
          >
            {t("info.about.hero.readGuide")}
          </Button>
        </div>
        <div className={C.GRID_4}>
          {facts.map(({ key, ...fact }) => (
            <StatCard
              key={key}
              {...fact}
              valueSize={EStatValueSize.LG}
              labelSize={EStatLabelSize.BASE}
              flashKeys={NO_FLASH_KEYS}
            />
          ))}
        </div>
      </div>
      <InfoSection id={ID.HOW_IT_WORKS} intro={t("info.about.howItWorks.intro")}>
        <InfoCardGrid
          columns={3}
          isOrdered
          items={HOW_IT_WORKS_STEPS.map(({ key, Icon }) => ({
            key,
            icon: Icon,
            eyebrow: t(`info.about.howItWorks.steps.${key}.label`),
            title: t(`info.about.howItWorks.steps.${key}.title`),
            text: t(`info.about.howItWorks.steps.${key}.text`, {
              university: PROPER_NAMES.UNIVERSITY,
            }),
          }))}
        />
      </InfoSection>
      <InfoSection id={ID.DATA_SOURCES} intro={t("info.about.sources.intro")}>
        <InfoCardGrid
          columns={1}
          items={[
            {
              key: "scrapi",
              title: "SCRAPI",
              isHighlighted: true,
              body: (
                <>
                  <p className={C.TEXT}>{t("info.about.sources.scrapi.text")}</p>
                  {scrapiAuthor !== "" && (
                    <p className={C.SMALL}>
                      {t("info.about.sources.scrapi.author", { author: scrapiAuthor })}
                    </p>
                  )}
                  {scrapiDocsUrl !== "" && (
                    <ExternalLink href={scrapiDocsUrl}>
                      {t("info.about.sources.scrapi.docs")}
                    </ExternalLink>
                  )}
                </>
              ),
            },
          ]}
        />
        <InfoCardGrid
          columns={2}
          items={DATA_SOURCES.map(({ key, name, url, note }) => ({
            key,
            title: name,
            text: t(`info.about.sources.${key}`),
            note,
            link: { href: url, label: t("info.about.sources.visit", { name }) },
          }))}
        />
      </InfoSection>
      {INFO_SECTIONS[ID.TEAM]?.isShown && <Team />}
      <InfoSection id={ID.SOURCE_CODE}>
        <dl className={C.DEFINITIONS}>
          {codeFacts.map(({ key, label, value }) => (
            <div key={key} className={C.DEFINITION}>
              <dt className={C.TEXT}>{label}</dt>
              <dd className={C.DEFINITION_VALUE}>{value}</dd>
            </div>
          ))}
        </dl>
        <div className={C.STACK_SMALL}>
          <h3 className={C.SUBHEADING}>{t("info.about.code.stack")}</h3>
          <ul className={C.CHIPS}>
            {TECH_STACK.map((name) => (
              <li key={name}>
                <Badge tone={TECH_BADGE_TONE}>{name}</Badge>
              </li>
            ))}
          </ul>
        </div>
        {(repositoryUrl !== "" || changelogUrl !== "") && (
          <div className={C.ACTIONS}>
            {repositoryUrl !== "" && (
              <ExternalLink href={repositoryUrl}>{t("info.about.code.repository")}</ExternalLink>
            )}
            {changelogUrl !== "" && (
              <ExternalLink href={changelogUrl}>{t("info.about.code.changelog")}</ExternalLink>
            )}
          </div>
        )}
      </InfoSection>
      {INFO_SECTIONS[ID.CITE]?.isShown && (
        <HowToCite citation={PROJECT_INFO.citation} bibtex={PROJECT_INFO.bibtex} />
      )}
      <InfoSection id={ID.PRIVACY}>
        <InfoList
          items={PRIVACY_POINTS.map((key) => ({ key, text: t(`info.about.privacy.${key}`) }))}
        />
      </InfoSection>
    </>
  );
}
