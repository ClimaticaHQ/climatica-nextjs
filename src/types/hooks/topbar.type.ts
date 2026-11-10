import type { MouseEvent } from "react";

/** A navbar link, drawn the same way in the desktop row and in the menu. */
export type TTopbarLink = {
  key: string;
  href: string;
  label: string;
  isActive: boolean;
  /** a page link's own navigation (useNavbarNavigation); absent: a plain link */
  onNavigate?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export type TTopbarHomeLink = Required<Pick<TTopbarLink, "href" | "onNavigate">>;

export type TTopbarMenuArgs = {
  /** the links collapsed into the menu from lg (useNavbarFit): the menu stays usable there */
  isCollapsed: boolean;
};
