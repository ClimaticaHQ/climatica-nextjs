"use client";

import { NAV_LINKS, ROUTES } from "@/constants";
import { useNavbarNavigation } from "@/hooks";
import { GLOBAL_CONFIG } from "@/libs/GlobalConfig";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ClimaticaLogo, GearIcon } from "../svg";

function BurgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="flex h-5 w-5 flex-col items-center justify-center gap-[5px]">
      <span
        className={`block h-[2px] w-5 origin-center rounded-full stroke-current transition-all duration-300 ${
          isOpen ? "translate-y-[7px] rotate-45" : ""
        }`}
        style={{ backgroundColor: "currentColor" }}
      />
      <span
        className={`block h-[2px] w-5 rounded-full stroke-current transition-all duration-300 ${
          isOpen ? "scale-x-0 opacity-0" : ""
        }`}
        style={{ backgroundColor: "currentColor" }}
      />
      <span
        className={`block h-[2px] w-5 origin-center rounded-full stroke-current transition-all duration-300 ${
          isOpen ? "-translate-y-[7px] -rotate-45" : ""
        }`}
        style={{ backgroundColor: "currentColor" }}
      />
    </div>
  );
}

export function Topbar() {
  const t = useTranslations();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  // * links to the other pages: the shared filters, plus (on click) the page's remembered params
  const { getHref, settingsHref, navigate } = useNavbarNavigation();
  const isSettingsActive = pathname === ROUTES.SETTINGS;

  useEffect(() => {
    queueMicrotask(() => setIsNavOpen(false));
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsNavOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isNavOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsNavOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [isNavOpen]);

  return (
    <header
      ref={headerRef}
      className="relative box-content h-16 w-full shrink-0 border-b pt-[env(safe-area-inset-top)] border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="flex h-full items-center pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        {/* * the home page is City Climate ("/" redirects there, dropping the query) — so the
         * logo goes the navbar's way: shared filters, plus City Climate's remembered params */}
        <Link
          href={getHref(ROUTES.CLIMATE_STATISTICS)}
          onClick={(event) => navigate(event, ROUTES.CLIMATE_STATISTICS)}
          className="flex flex-1 items-center gap-2.5 text-[var(--color-brand)] hover:opacity-80 transition-opacity duration-150"
        >
          <ClimaticaLogo className="h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 shrink-0" />
          <span className="text-[length:var(--font-md)] lg:text-[length:var(--font-lg)] font-semibold tracking-wide leading-none">
            {GLOBAL_CONFIG.appName}
          </span>
        </Link>

        <nav className="hidden gap-3 lg:flex">
          {NAV_LINKS.map(({ to, labelKey }) => {
            const isActive = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                href={getHref(to)}
                onClick={(event) => navigate(event, to)}
                className={`rounded-[var(--radius-sm)] px-4 py-2 text-[length:var(--font-sm)] font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-[var(--color-primary-muted)] font-medium text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)]"
                }`}
              >
                {t(labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1">
          <Link
            href={settingsHref}
            aria-label={t("navbar.settings")}
            aria-current={isSettingsActive ? "page" : undefined}
            className={`hidden h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] transition-colors duration-150 lg:flex ${
              isSettingsActive
                ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)]"
            }`}
          >
            <GearIcon />
          </Link>

          <button
            type="button"
            aria-label={t("navbar.toggleMenu")}
            aria-expanded={isNavOpen}
            onClick={() => setIsNavOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)] lg:hidden"
          >
            <BurgerIcon isOpen={isNavOpen} />
          </button>
        </div>
      </div>

      <div
        className={`
          absolute left-0 right-0 top-full z-50
          border-t border-[var(--color-border)] bg-[var(--color-surface)] shadow-md
          transition-all duration-300 ease-in-out lg:hidden
          ${isNavOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"}
        `}
      >
        <ul className="flex max-h-[calc(100dvh-4rem-env(safe-area-inset-top))] list-none flex-col gap-1 overflow-y-auto pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          {NAV_LINKS.map(({ to, labelKey }) => {
            const isActive = pathname === to || pathname.startsWith(to + "/");
            return (
              <li key={to}>
                <Link
                  href={getHref(to)}
                  onClick={(event) => {
                    setIsNavOpen(false);
                    navigate(event, to);
                  }}
                  className={`block w-full rounded-[var(--radius-sm)] px-4 py-3 text-[length:var(--font-sm)] transition-colors duration-150 ${
                    isActive
                      ? "bg-[var(--color-primary)] font-medium text-[var(--color-on-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {t(labelKey)}
                </Link>
              </li>
            );
          })}

          <li className="mt-2 border-t border-[var(--color-border)] pt-3">
            <Link
              href={settingsHref}
              onClick={() => setIsNavOpen(false)}
              aria-current={isSettingsActive ? "page" : undefined}
              className={`block w-full rounded-[var(--radius-sm)] px-4 py-3 text-[length:var(--font-sm)] transition-colors duration-150 ${
                isSettingsActive
                  ? "bg-[var(--color-primary)] font-medium text-[var(--color-on-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              {t("navbar.settings")}
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
