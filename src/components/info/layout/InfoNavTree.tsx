"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { INFO_NAV_CLASSES as C } from "../info.constant";
import type { TInfoNavTreeProps } from "../info.type";
import { InfoSectionList } from "./InfoSectionList";

/**
 * The Info pages as one tree — the sidebar's from lg, the Contents sheet's below: the pages,
 * the current one marked, and its sections nested under it behind a rule, the one in view
 * marked on it.
 */
export function InfoNavTree({
  pages,
  currentRoute,
  sections,
  activeId,
  getPageHref,
  onSectionClick,
  onPageClick,
  hasLargeTargets,
}: TInfoNavTreeProps) {
  const t = useTranslations();
  const size = hasLargeTargets ? C.LARGE : C.REGULAR;

  return (
    <ul className={C.PAGES}>
      {pages.map(({ route, labelKey }) => {
        const isCurrent = route === currentRoute;
        const href = getPageHref(route);
        return (
          <li key={route}>
            <Link
              href={href}
              {...(onPageClick ? { onClick: (event) => onPageClick(event, href) } : {})}
              aria-current={isCurrent ? "page" : undefined}
              className={`${C.PAGE_LINK} ${size.PAGE_LINK} ${isCurrent ? C.PAGE_LINK_ACTIVE : C.PAGE_LINK_IDLE}`}
            >
              {t(labelKey)}
            </Link>
            {isCurrent && sections.length > 0 && (
              <InfoSectionList
                sections={sections}
                activeId={activeId}
                onSectionClick={onSectionClick}
                linkSizeClass={size.SECTION_LINK}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
