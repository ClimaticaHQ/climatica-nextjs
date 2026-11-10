"use client";

import { useTranslations } from "next-intl";
import { EXTERNAL_LINK_CLASS, EXTERNAL_LINK_TARGET_CLASS } from "./ExternalLink.constant";
import type { TExternalLinkProps } from "./ExternalLink.type";

/** A link to another site, in a new tab — which screen readers are told. */
export function ExternalLink({
  href,
  className = EXTERNAL_LINK_CLASS,
  children,
}: TExternalLinkProps) {
  const t = useTranslations();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${EXTERNAL_LINK_TARGET_CLASS} ${className}`}
    >
      {children}
      <span className="sr-only"> {t("info.externalLink")}</span>
    </a>
  );
}
