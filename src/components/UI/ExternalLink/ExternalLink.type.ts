import type { ReactNode } from "react";

export type TExternalLinkProps = {
  href: string;
  /** replaces the default inline link look */
  className?: string;
  children: ReactNode;
};
