import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { ExportMenuProps } from "./ExportMenu.type";

function ImageIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="5.5" cy="6.5" r="1" fill="currentColor" />
      <path
        d="M1 11l3.5-3.5 2.5 2.5 2-2 4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <path
        d="M5 4L1 8l4 4M11 4l4 4-4 4M9 2l-2 12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <rect x="1" y="2" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 6h14M6 6v8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 10 6"
      fill="none"
      className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ExportMenu({
  onExportCSV,
  onExportPNG,
  onExportSVG,
  isDisabled = false,
}: ExportMenuProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  async function handleExportPNG() {
    setIsOpen(false);
    setIsExporting(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 150));
    await onExportPNG();
    setIsExporting(false);
  }

  async function handleExportSVG() {
    if (!onExportSVG) return;
    setIsOpen(false);
    setIsExporting(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 150));
    onExportSVG();
    setIsExporting(false);
  }

  function handleExportCSV() {
    setIsOpen(false);
    onExportCSV();
  }

  const options = [
    { label: t("exportMenu.png"), icon: <ImageIcon />, handler: () => void handleExportPNG() },
    ...(onExportSVG !== undefined
      ? [{ label: t("exportMenu.svg"), icon: <CodeIcon />, handler: () => void handleExportSVG() }]
      : []),
    { label: t("exportMenu.csv"), icon: <TableIcon />, handler: handleExportCSV },
  ];

  return (
    <div ref={ref} className="relative" style={{ pointerEvents: isExporting ? "none" : "auto" }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isDisabled}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-[length:var(--font-sm)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t("exportMenu.button")}
        <ChevronDownIcon open={isOpen} />
      </button>

      <div
        className={`absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-md transition-all duration-150 origin-top ${
          isOpen
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-95 pointer-events-none"
        }`}
      >
        {options.map(({ label, icon, handler }) => (
          <button
            key={label}
            type="button"
            onClick={handler}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[length:var(--font-sm)] text-[var(--color-text)] transition-colors duration-100 hover:bg-[var(--color-bg-secondary)]"
          >
            {icon}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
