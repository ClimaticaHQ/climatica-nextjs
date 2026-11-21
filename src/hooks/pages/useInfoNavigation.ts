"use client";

import { INFO_PAGES } from "@/constants";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useActiveSection } from "../ui/useActiveSection";
import { useSheetHistory } from "../ui/useSheetHistory";
import { useNavbarNavigation } from "../url/useNavbarNavigation";

/**
 * The Info pages' navigation, for the sidebar (from lg) and the Contents bar and sheet (below):
 * the current page, its shown sections, the one in view (one scroll spy for both), and the
 * sheet. Links keep the shared filters, like the navbar's.
 */
export function useInfoNavigation() {
  const pathname = usePathname();
  const { getPlainHref, pushHref } = useNavbarNavigation();
  const currentPage = INFO_PAGES.find(({ route }) => pathname === route) ?? null;
  const sections = currentPage?.sections.filter(({ isShown }) => isShown) ?? [];
  const { activeId, select } = useActiveSection(sections.map(({ id }) => id));
  const [isContentsOpen, setIsContentsOpen] = useState(false);
  const sectionKey = sections.map(({ id }) => id).join(" ");

  // * a page opened on a section's hash: the browser may try its jump while the streamed page is
  // * still hidden, and not try again — land there once the sections are in
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id === "" || !sectionKey.split(" ").includes(id)) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
  }, [sectionKey]);
  const { closeSheet } = useSheetHistory({
    isOpen: isContentsOpen,
    onClose: () => setIsContentsOpen(false),
  });

  // * from the sheet, the move waits for it to close: its history entry is popped first, as the
  // * filters sheet does — a navigation while it's open would leave a dead Back entry behind
  async function goToSection(id: string) {
    await closeSheet();
    select(id);
    const hash = `#${id}`;
    if (window.location.hash !== hash) window.location.hash = hash;
    // * a hash set right after the sheet's history step doesn't scroll <main> by itself (the
    // * jump is lost while the sheet unmounts): scroll on the next frame, scroll margin included
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }

  async function goToPage(href: string) {
    await closeSheet();
    pushHref(href);
  }

  return {
    currentPage,
    sections,
    activeId,
    activeSection: sections.find(({ id }) => id === activeId) ?? null,
    getPageHref: getPlainHref,
    selectSection: select,
    isContentsOpen,
    openContents: () => setIsContentsOpen(true),
    closeContents: () => void closeSheet(),
    goToSection,
    goToPage,
  };
}
