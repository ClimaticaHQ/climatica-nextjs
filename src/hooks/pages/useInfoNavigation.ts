"use client";

import { INFO_PAGES } from "@/constants";
import { usePathname } from "next/navigation";
import { scrollToSectionAfterSheetClose } from "@/utils/scroll.util";
import { useState } from "react";
import { useActiveSection } from "../ui/useActiveSection";
import { useLandOnHashSection } from "../ui/useLandOnHashSection";
import { useSheetHistory } from "../ui/useSheetHistory";
import { useNavbarNavigation } from "../url/useNavbarNavigation";

export function useInfoNavigation() {
  const pathname = usePathname();
  const { getPlainHref, pushHref, navigatePlain, pendingRoute } = useNavbarNavigation();
  const currentPage = INFO_PAGES.find(({ route }) => pathname === route) ?? null;
  const sections = currentPage?.sections.filter(({ isShown }) => isShown) ?? [];
  const sectionIds = sections.map(({ id }) => id);
  const { activeId, select } = useActiveSection(sectionIds);
  const [isContentsOpen, setIsContentsOpen] = useState(false);

  useLandOnHashSection(sectionIds);

  const { closeSheet } = useSheetHistory({
    isOpen: isContentsOpen,
    onClose: () => setIsContentsOpen(false),
  });

  async function goToSection(id: string) {
    await closeSheet();
    select(id);
    const hash = `#${id}`;
    if (window.location.hash !== hash) window.location.hash = hash;
    scrollToSectionAfterSheetClose(id);
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
    openingRoute: pendingRoute,
    openPage: navigatePlain,
    selectSection: select,
    isContentsOpen,
    openContents: () => setIsContentsOpen(true),
    closeContents: () => void closeSheet(),
    goToSection,
    goToPage,
  };
}
