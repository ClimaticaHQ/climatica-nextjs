import Link from "next/link";
import { TOPBAR_LINK_CLASSES as L, TOPBAR_MENU_CLASSES as C } from "./Topbar.constant";
import type { TTopbarMenuProps } from "./Topbar.type";

/**
 * The navbar's menu under the bar: every page, then Settings. Below lg, and from lg while the
 * links don't fit. A tap on a link closes it.
 */
export function TopbarMenu({ links, settings, isOpen, isCollapsed, onClose }: TTopbarMenuProps) {
  const items = [
    ...links.map((link) => ({ link, className: "" })),
    { link: settings, className: C.SETTINGS_ITEM },
  ];

  return (
    <div
      className={`${C.PANEL} ${isCollapsed ? "" : L.MENU_ONLY_BELOW_LG} ${isOpen ? C.OPEN : C.CLOSED}`}
    >
      <ul className={C.LIST}>
        {items.map(({ link: { key, href, label, isActive, onNavigate }, className }) => (
          <li key={key} className={className}>
            <Link
              href={href}
              onClick={(event) => {
                onClose();
                onNavigate?.(event);
              }}
              aria-current={isActive ? "page" : undefined}
              className={`${L.MOBILE} ${isActive ? L.MOBILE_ACTIVE : L.IDLE}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
