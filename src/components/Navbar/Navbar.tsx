"use client";

import { LanguageSwitcher } from "@/components";
import { LANGUAGE_SWITCHER_VARIANTS, NAV_LINKS } from "@/constants";
import { GLOBAL_CONFIG } from "@/libs/GlobalConfig";

import { Link, usePathname } from "@/libs/I18nNavigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const t = useTranslations();
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) setIsOpen(false);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (window.innerWidth >= 640) return;

      const target = event.target as Node | null;
      if (!target) return;

      if (navRef.current && !navRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <nav
      ref={navRef}
      className={`
        sticky top-0 z-50 w-full
        border-b border-[var(--color-border)]
        bg-[var(--color-bg)]
      `}
    >
      <div className={`max-w-[960px] mx-auto px-4 h-20 flex items-center justify-between`}>
        <span
          className={`text-[length:var(--font-lg)] md:text-[length:var(--font-xl)] lg:text-[length:var(--font-2xl)] font-bold text-[var(--color-primary)]`}
        >
          {GLOBAL_CONFIG.appName}
        </span>

        {/* desktop navbar view */}
        <ul className={`hidden sm:flex items-center gap-3 list-none`}>
          {NAV_LINKS.map(({ to, labelKey }) => {
            const isActive = pathname === to || pathname.startsWith(to + "/");
            return (
              <li key={to}>
                <Link
                  href={to}
                  className={`px-4 py-2 rounded-[var(--radius-sm)] text-[length:var(--font-md)] md:text-[length:var(--font-md)] lg:text-[length:var(--font-lg)]
                   transition-colors duration-150
                   ${
                     isActive
                       ? "bg-[var(--color-primary)] text-[var(--color-bg)]"
                       : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
                   }`}
                >
                  {t(labelKey)}
                </Link>
              </li>
            );
          })}
          <li>
            <LanguageSwitcher />
          </li>
        </ul>

        {/* hamburger button, mobile only */}
        <button
          className={`sm:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-secondary)] transition-colors`}
          onClick={() => setIsOpen((o) => !o)}
          aria-label={t("navbar.toggleMenu")}
          aria-expanded={isOpen}
        >
          <span
            className={`block h-[2px] w-6 bg-[var(--color-text)] rounded-full transition-all duration-300 origin-center
              ${isOpen ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`block h-[2px] w-6 bg-[var(--color-text)] rounded-full transition-all duration-300
              ${isOpen ? "opacity-0 scale-x-0" : ""}`}
          />
          <span
            className={`block h-[2px] w-6 bg-[var(--color-text)] rounded-full transition-all duration-300 origin-center
              ${isOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* mobile dropdown */}
      <div
        className={`
          sm:hidden absolute top-full left-0 right-0 z-50
          border-t border-[var(--color-border)]
          bg-[var(--color-bg)] shadow-md
          ${isOpen ? `opacity-100 pointer-events-auto translate-y-0` : `opacity-0 pointer-events-none -translate-y-2`}
          transition-all duration-300 ease-in-out
        `}
      >
        <ul className={`flex flex-col px-4 py-3 gap-1 list-none`}>
          {NAV_LINKS.map(({ to, labelKey }) => {
            const isActive = pathname === to || pathname.startsWith(to + "/");
            return (
              <li key={to}>
                <Link
                  href={to}
                  onClick={() => setIsOpen(false)}
                  className={`block w-full px-4 py-3 rounded-[var(--radius-sm)] text-[length:var(--font-sm)]
                   transition-colors duration-150
                   ${
                     isActive
                       ? "bg-[var(--color-primary)] text-[var(--color-bg)] font-medium"
                       : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
                   }`}
                >
                  {t(labelKey)}
                </Link>
              </li>
            );
          })}

          {/* desktop */}
          <li className={`hidden md:block`}>
            <LanguageSwitcher variant={LANGUAGE_SWITCHER_VARIANTS.DROPDOWN} />
          </li>

          {/* mobile */}
          <li className="md:hidden pt-2 mt-2 border-t border-[var(--color-border)]">
            <LanguageSwitcher variant={LANGUAGE_SWITCHER_VARIANTS.INLINE} />
          </li>
        </ul>
      </div>
    </nav>
  );
}
