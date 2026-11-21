"use client";

import { SidePanel } from "@/components/UI/SidePanel";
import { INFO_PAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { InfoNavigationContext } from "../infoNavigation.context";
import { InfoNavTree } from "./InfoNavTree";

/**
 * The Info pages' navigation in the app's left panel, from lg (hidden below by its classes):
 * rendered on the server with the page and its sections; only the section in view follows on
 * the client.
 */
export function InfoSidePanel() {
  const t = useTranslations();
  const nav = useContext(InfoNavigationContext);
  if (nav === null) return null;

  return (
    <SidePanel>
      <nav aria-label={t("info.nav.label")}>
        <InfoNavTree
          pages={INFO_PAGES}
          currentRoute={nav.currentPage?.route ?? null}
          sections={nav.sections}
          activeId={nav.activeId}
          getPageHref={nav.getPageHref}
          onSectionClick={(_, id) => nav.selectSection(id)}
          hasLargeTargets={false}
        />
      </nav>
    </SidePanel>
  );
}
