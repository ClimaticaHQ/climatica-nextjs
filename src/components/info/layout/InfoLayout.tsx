"use client";

import { BottomSheet } from "@/components/UI/BottomSheet";
import { PageWrapper } from "@/components/UI/PageWrapper";
import { INFO_PAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { INFO_CLASSES as C } from "../info.constant";
import type { TInfoLayoutProps } from "../info.type";
import { InfoNavigationContext } from "../infoNavigation.context";
import { InfoContentsBar } from "./InfoContentsBar";
import { InfoNavTree } from "./InfoNavTree";

/**
 * The Info pages' content frame. Below lg the Contents bar above the content (hidden from lg by
 * its classes) and the navigation tree in a bottom sheet; from lg the tree is the side panel's
 * (InfoSidePanel). Both read the one navigation of InfoNavigationProvider.
 */
export function InfoLayout({ children }: TInfoLayoutProps) {
  const t = useTranslations();
  const nav = useContext(InfoNavigationContext);
  if (nav === null) return null;
  const tree = {
    pages: INFO_PAGES,
    currentRoute: nav.currentPage?.route ?? null,
    // * the sheet closes when a page is picked: it only ever shows the current one open
    openRoute: nav.currentPage?.route ?? null,
    activeId: nav.activeId,
    getPageHref: nav.getPageHref,
  };

  return (
    <>
      {nav.currentPage !== null && (
        <InfoContentsBar
          pageLabel={t(nav.currentPage.labelKey)}
          sectionLabel={nav.activeSection ? t(nav.activeSection.labelKey) : null}
          isOpen={nav.isContentsOpen}
          onOpen={nav.openContents}
        />
      )}
      <PageWrapper>
        <div className={C.CONTENT}>{children}</div>
      </PageWrapper>
      <BottomSheet
        isOpen={nav.isContentsOpen}
        onClose={nav.closeContents}
        title={t("info.nav.contents")}
      >
        <nav aria-label={t("info.nav.label")}>
          <InfoNavTree
            {...tree}
            onSectionClick={(event, id) => {
              event.preventDefault();
              void nav.goToSection(id);
            }}
            onPageClick={(event, route) => {
              event.preventDefault();
              void nav.goToPage(nav.getPageHref(route));
            }}
            hasLargeTargets
          />
        </nav>
      </BottomSheet>
    </>
  );
}
