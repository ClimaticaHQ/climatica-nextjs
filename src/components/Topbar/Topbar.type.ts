import type { TTopbarLink } from "@/types";
import type { Ref } from "react";

export type TTopbarLinksProps = {
  links: readonly TTopbarLink[];
  navRef: Ref<HTMLElement>;
  /** out of the way but still measured, while they don't fit (useNavbarFit) */
  isCollapsed: boolean;
};

export type TTopbarMenuProps = {
  links: readonly TTopbarLink[];
  settings: TTopbarLink;
  isOpen: boolean;
  /** shown from lg too, while the desktop links are collapsed */
  isCollapsed: boolean;
  onClose: () => void;
};
