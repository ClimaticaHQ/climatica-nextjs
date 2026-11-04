"use client";

import { BottomSheet } from "@/components/UI/BottomSheet";
import { PageWrapper } from "@/components/UI/PageWrapper";
import { INFO_PAGES } from "@/constants";
import { useInfoNavigation } from "@/hooks/pages/useInfoNavigation";
import { useTranslations } from "next-intl";
import { INFO_CLASSES as C } from "../info.constant";
import type { TInfoLayoutProps } from "../info.type";
import { InfoContentsBar } from "./InfoContentsBar";
import { InfoNavTree } from "./InfoNavTree";

/**
 * The Info pages' frame. From lg, the navigation tree beside the content; below, the Contents
 * bar above it and the same tree in a bottom sheet. One scroll spy serves both.
 */
export function InfoLayout({ children, footer }: TInfoLayoutProps) {
  const t = useTranslations();
  const nav = useInfoNavigation();
  const tree = {
    pages: INFO_PAGES,
    currentRoute: nav.currentPage?.route ?? null,
    sections: nav.sections,
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
        <div className={C.LAYOUT}>
          <nav aria-label={t("info.nav.label")} className={C.SIDEBAR}>
            <InfoNavTree
              {...tree}
              onSectionClick={(_, id) => nav.selectSection(id)}
              hasLargeTargets={false}
            />
          </nav>
          <div className={C.CONTENT}>
            {children}
            {footer}
          </div>
        </div>
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
            onPageClick={(event, href) => {
              event.preventDefault();
              void nav.goToPage(href);
            }}
            hasLargeTargets
          />
        </nav>
      </BottomSheet>
    </>
  );
}
