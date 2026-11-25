import type { MouseEvent } from "react";

export type TTopbarLink = {
  key: string;
  href: string;
  label: string;
  isActive: boolean;
  isHighlighted: boolean;
  onNavigate?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export type TTopbarHomeLink = Required<Pick<TTopbarLink, "href" | "onNavigate">>;

export type TTopbarMenuArgs = {
  isCollapsed: boolean;
};
