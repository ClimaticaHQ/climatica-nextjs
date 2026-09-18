import { ChevronDownIcon, CodeIcon, ImageIcon, SpinnerIcon, TableIcon } from "@/components/svg";
import { TExportOptionKey } from "@/types";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { ExportMenuProps } from "./ExportMenu.type";

export function ExportMenu({
  onExportCSV,
  onExportPNG,
  onExportSVG,
  onExportRawCsv,
  onExportRawJson,
  isRawDataAvailable = true,
  isDisabled = false,
}: ExportMenuProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingKey, setLoadingKey] = useState<TExportOptionKey | null>(null);
  const [errorKey, setErrorKey] = useState<TExportOptionKey | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (loadingKey !== null) return;
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [loadingKey]);

  async function runExport(key: TExportOptionKey, action: () => void | Promise<void>) {
    setLoadingKey(key);
    setErrorKey(null);
    try {
      await action();
      setIsOpen(false);
    } catch {
      setErrorKey(key);
    } finally {
      setLoadingKey(null);
    }
  }

  function handleExportCSV() {
    setIsOpen(false);
    setErrorKey(null);
    onExportCSV();
  }

  const options = [
    {
      key: "png" as const,
      label: t("exportMenu.png"),
      icon: <ImageIcon />,
      handler: () => void runExport("png", onExportPNG),
      disabled: false,
    },
    ...(onExportSVG !== undefined
      ? [
          {
            key: "svg" as const,
            label: t("exportMenu.svg"),
            icon: <CodeIcon />,
            handler: () => void runExport("svg", onExportSVG),
            disabled: false,
          },
        ]
      : []),
    {
      key: "csv" as const,
      label: t("exportMenu.csv"),
      icon: <TableIcon />,
      handler: handleExportCSV,
      disabled: false,
    },
    ...(onExportRawCsv !== undefined
      ? [
          {
            key: "rawCsv" as const,
            label: t("exportMenu.rawCsv"),
            icon: <TableIcon />,
            handler: () => void runExport("rawCsv", onExportRawCsv),
            disabled: !isRawDataAvailable,
          },
        ]
      : []),
    ...(onExportRawJson !== undefined
      ? [
          {
            key: "rawJson" as const,
            label: t("exportMenu.rawJson"),
            icon: <CodeIcon />,
            handler: () => void runExport("rawJson", onExportRawJson),
            disabled: !isRawDataAvailable,
          },
        ]
      : []),
  ];

  return (
    <div ref={ref} className="relative" style={{ pointerEvents: loadingKey ? "none" : "auto" }}>
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
        className={`absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-md transition-all duration-150 origin-top ${
          isOpen
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-95 pointer-events-none"
        }`}
      >
        {options.map(({ key, label, icon, handler, disabled }) => (
          <button
            key={key}
            type="button"
            onClick={handler}
            disabled={disabled}
            title={disabled ? t("exportMenu.rawDataUnavailable") : undefined}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[length:var(--font-sm)] text-[var(--color-text)] transition-colors duration-100 hover:bg-[var(--color-bg-secondary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            {loadingKey === key ? <SpinnerIcon /> : icon}
            {label}
          </button>
        ))}
        {errorKey !== null && (
          <p className="px-3 pb-2 text-[length:var(--font-xs)] text-[var(--color-error)]">
            {t("exportMenu.failed")}
          </p>
        )}
      </div>
    </div>
  );
}
