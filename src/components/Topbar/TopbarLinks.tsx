import Link from "next/link";
import { TOPBAR_LINK_CLASSES as L } from "./Topbar.constant";
import type { TTopbarLinksProps } from "./Topbar.type";

/** The navbar's links in one row, from lg — inert and unseen while they don't fit. */
export function TopbarLinks({ links, navRef, isCollapsed }: TTopbarLinksProps) {
  return (
    <nav
      ref={navRef}
      inert={isCollapsed}
      className={`${L.DESKTOP_ROW} ${isCollapsed ? L.DESKTOP_ROW_COLLAPSED : ""}`}
    >
      {links.map(({ key, href, label, isActive, onNavigate }) => (
        <Link
          key={key}
          href={href}
          {...(onNavigate ? { onClick: onNavigate } : {})}
          aria-current={isActive ? "page" : undefined}
          className={`${L.DESKTOP} ${isActive ? L.DESKTOP_ACTIVE : L.IDLE}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
