import type { TTopbarLink } from "@/types";
import type { Ref } from "react";

export type TTopbarLinksProps = {
  links: readonly TTopbarLink[];
  navRef: Ref<HTMLElement>;
  isCollapsed: boolean;
};

export type TTopbarMenuProps = {
  links: readonly TTopbarLink[];
  settings: TTopbarLink;
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
};
