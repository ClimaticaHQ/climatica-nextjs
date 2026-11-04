"use client";

import { ExternalLink } from "@/components/UI/ExternalLink";
import { INFO_CLASSES as C, INFO_LIST_CLASSES as L } from "../info.constant";
import type { TInfoListProps } from "../info.type";

/**
 * A list on the Info pages: bullets, or numbers; when its items have icons, a column of icon
 * rows instead. An item can end with a link to another site.
 */
export function InfoList({ items, isNumbered = false }: TInfoListProps) {
  const hasIcons = items.some(({ icon }) => icon !== undefined);
  const List = isNumbered ? "ol" : "ul";
  const listClass = isNumbered ? C.NUMBERED_LIST : hasIcons ? L.ICONS : C.LIST;

  return (
    <List className={listClass}>
      {items.map(({ key, text, icon: Icon, link }) =>
        Icon !== undefined ? (
          <li key={key} className={L.ICON_ITEM}>
            <span className={C.ICON}>
              <Icon />
            </span>
            <span className={C.TEXT}>{text}</span>
          </li>
        ) : (
          <li key={key}>
            {text}
            {link !== undefined && (
              <>
                {" "}
                <ExternalLink href={link.href}>{link.label}</ExternalLink>
              </>
            )}
          </li>
        ),
      )}
    </List>
  );
}
