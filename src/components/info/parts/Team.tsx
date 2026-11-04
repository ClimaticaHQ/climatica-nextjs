"use client";

import { Card } from "@/components/Card";
import { ExternalLinkIcon } from "@/components/svg";
import { AFFILIATION_SEPARATOR, INFO_SECTION_IDS, TEAM } from "@/constants";
import { ECardPadding, ECardSize } from "@/enums";
import { getInitials } from "@/utils/info.util";
import { useTranslations } from "next-intl";
import { Fragment } from "react";
import { ExternalLink } from "@/components/UI/ExternalLink";
import { TEAM_CARD_CLASSES as C } from "../info.constant";
import { InfoSection } from "./InfoSection";

/**
 * The people behind Climatica, one card each, all alike: initials, then name (a link to their
 * profile), role and affiliation. Cards in a row are the same height; content stays at the top.
 */
export function Team() {
  const t = useTranslations();
  return (
    <InfoSection id={INFO_SECTION_IDS.TEAM}>
      <ul className={C.GRID}>
        {TEAM.map(({ id, name, roleKey, affiliation, profileUrl }) => (
          <li key={id} className={C.ITEM}>
            <Card size={ECardSize.MD} padding={ECardPadding.COMPACT} className={C.CARD}>
              <span className={C.AVATAR} aria-hidden="true">
                {getInitials(name)}
              </span>
              <span className={C.TEXT}>
                <ExternalLink href={profileUrl} className={C.NAME}>
                  {name}
                  <ExternalLinkIcon className={C.NAME_ICON} />
                </ExternalLink>
                <span className={C.DETAIL}>{t(`info.about.team.roles.${roleKey}`)}</span>
                <span className={C.DETAIL}>
                  {affiliation.split(AFFILIATION_SEPARATOR).map((part, index) => (
                    <Fragment key={part}>
                      {index > 0 && AFFILIATION_SEPARATOR}
                      <span className={C.AFFILIATION_PART}>{part}</span>
                    </Fragment>
                  ))}
                </span>
              </span>
            </Card>
          </li>
        ))}
      </ul>
    </InfoSection>
  );
}
