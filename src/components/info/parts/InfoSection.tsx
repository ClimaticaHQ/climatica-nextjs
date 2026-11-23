"use client";

import { useTranslations } from "next-intl";
import { INFO_SECTIONS } from "@/constants";
import { INFO_CLASSES as C } from "../info.constant";
import type { TInfoSectionProps } from "../info.type";

/** One section of an Info page: an anchor ("On this page" links to it), its title and its content. */
export function InfoSection({ id, intro, children }: TInfoSectionProps) {
  const t = useTranslations();
  const section = INFO_SECTIONS[id];
  if (section === undefined) return null;
  const titleId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={titleId} className={C.SECTION}>
      <h2 id={titleId} className={C.HEADING}>
        {t(section.labelKey)}
      </h2>
      {intro !== undefined && <p className={C.TEXT}>{intro}</p>}
      {children}
    </section>
  );
}
