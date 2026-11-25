"use client";

import { useEffect } from "react";

export function useLandOnHashSection(sectionIds: readonly string[]) {
  const sectionKey = sectionIds.join(" ");

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
}
