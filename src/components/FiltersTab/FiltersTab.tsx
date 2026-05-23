import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFiltersTabProps } from "./FiltersTab.type";

function ArrowTopIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 12.5L10 7.5L15 12.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FiltersTab({ children, summary, className = "" }: TFiltersTabProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <div
      className={`w-full rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden ${className}`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[var(--color-bg-secondary)] transition-colors duration-150 cursor-pointer"
      >
        <span className="flex items-center gap-2.5 text-sm font-medium text-[var(--color-text-strong)]">
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
            <path
              d="M3 5h14M6 10h8M9 15h2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          {t("climateStatistics.filtersTab")}
        </span>

        <div className="flex items-center gap-2.5">
          {summary && (
            <div
              aria-hidden={isOpen}
              className={`flex gap-1.5 transition-[opacity,transform] duration-200 ${
                isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              {summary}
            </div>
          )}
          <ArrowTopIcon
            className={`h-4 w-4 text-[var(--color-text-secondary)] transition-transform duration-300 ${
              isOpen ? "rotate-0" : "rotate-180"
            }`}
          />
        </div>
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-[320ms] ease-[cubic-bezier(.4,0,.2,1)] ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`px-5 pb-5 pt-5 border-t border-[var(--color-border)] flex flex-col gap-6 transition-[opacity,transform] duration-[250ms] delay-[60ms] ${
              isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1.5"
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
