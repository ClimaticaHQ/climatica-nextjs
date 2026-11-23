"use client";

import { useNavbarFit, useTopbarLinks, useTopbarMenu } from "@/hooks";
import { GLOBAL_CONFIG } from "@/libs/GlobalConfig";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BurgerIcon, ClimaticaLogo, GearIcon } from "../svg";
import { TOPBAR_CLASSES as C, TOPBAR_LINK_CLASSES as L } from "./Topbar.constant";
import { TopbarLinks } from "./TopbarLinks";
import { TopbarMenu } from "./TopbarMenu";

/** The app's bar: the logo, the page links (or the menu when they don't fit) and Settings. */
export function Topbar() {
  const t = useTranslations();
  const { pages, settings, home } = useTopbarLinks();
  const { rowRef, navRef, isCollapsed } = useNavbarFit();
  const { headerRef, isOpen, toggle, close } = useTopbarMenu({ isCollapsed });

  return (
    <header ref={headerRef} className={C.HEADER}>
      <div ref={rowRef} className={C.ROW}>
        <Link href={home.href} onClick={home.onNavigate} className={C.LOGO}>
          <ClimaticaLogo className={C.LOGO_MARK} />
          <span className={C.LOGO_NAME}>{GLOBAL_CONFIG.appName}</span>
        </Link>
        <TopbarLinks links={pages} navRef={navRef} isCollapsed={isCollapsed} />
        <div className={C.CONTROLS}>
          <Link
            href={settings.href}
            {...(settings.onNavigate ? { onClick: settings.onNavigate } : {})}
            aria-label={settings.label}
            aria-current={settings.isActive ? "page" : undefined}
            className={`${C.SETTINGS} ${settings.isActive ? C.SETTINGS_ACTIVE : L.IDLE}`}
          >
            <GearIcon />
          </Link>
          <button
            type="button"
            aria-label={t("navbar.toggleMenu")}
            aria-expanded={isOpen}
            onClick={toggle}
            className={`${C.MENU_BUTTON} ${isCollapsed ? "" : L.MENU_ONLY_BELOW_LG}`}
          >
            <BurgerIcon isOpen={isOpen} />
          </button>
        </div>
      </div>
      <TopbarMenu
        links={pages}
        settings={settings}
        isOpen={isOpen}
        isCollapsed={isCollapsed}
        onClose={close}
      />
    </header>
  );
}
