"use client";

import { INFO_PAGES } from "@/constants";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useActiveSection } from "../ui/useActiveSection";
import { useSheetHistory } from "../ui/useSheetHistory";
import { useNavbarNavigation } from "../url/useNavbarNavigation";

export function useInfoNavigation() {
  const pathname = usePathname();
  const { getPlainHref, pushHref, navigatePlain, pendingRoute } = useNavbarNavigation();
  const currentPage = INFO_PAGES.find(({ route }) => pathname === route) ?? null;
  const sections = currentPage?.sections.filter(({ isShown }) => isShown) ?? [];
  const { activeId, select } = useActiveSection(sections.map(({ id }) => id));
  const [isContentsOpen, setIsContentsOpen] = useState(false);
  const sectionKey = sections.map(({ id }) => id).join(" ");

  // * the browser's #hash jump fires while the streamed page is still a fallback and is never retried
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id === "" || !sectionKey.split(" ").includes(id)) return;
    const land = () => {
      const section = document.getElementById(id);
      section?.scrollIntoView({ behavior: "instant" });
      return section !== null;
    };
    if (land()) return;
    const observer = new MutationObserver(() => {
      if (land()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [sectionKey]);

  const { closeSheet } = useSheetHistory({
    isOpen: isContentsOpen,
    onClose: () => setIsContentsOpen(false),
  });

  async function goToSection(id: string) {
    await closeSheet();
    select(id);
    const hash = `#${id}`;
    if (window.location.hash !== hash) window.location.hash = hash;
    // * the hash jump is lost while the sheet unmounts, so scroll on the next frame
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
