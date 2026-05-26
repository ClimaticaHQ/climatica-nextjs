import { Button, ExportMenu } from "@/components/UI";
import { EButtonVariant } from "@/enums";
import { useTranslation } from "react-i18next";
import type { TToolbarProps } from "../HeatMap.type";

function BoxIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="14"
        height="14"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeDasharray={active ? "none" : "4 2"}
      />
    </svg>
  );
}

function PolygonIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <polygon
        points="10,2 17.66,6 17.66,14 10,18 2.34,14 2.34,6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeDasharray={active ? "none" : "4 2"}
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Toolbar({
  drawMode,
  hasSelection,
  onBboxModeToggle,
  onPolygonModeToggle,
  onClear,
  onExportCSV,
  onExportPNG,
}: TToolbarProps) {
  const { t } = useTranslation();
  const activeClass =
    "border-[var(--color-primary)] bg-[var(--color-chip-active-bg)] text-[var(--color-chip-active-text)]";
  const inactiveClass =
    "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onBboxModeToggle}
        className={`flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 text-[length:var(--font-sm)] font-medium transition-colors duration-150 ${drawMode === "bbox" ? activeClass : inactiveClass}`}
      >
        <BoxIcon active={drawMode === "bbox"} />
        {t("heatMap.drawBbox")}
      </button>

      <button
        type="button"
        onClick={onPolygonModeToggle}
        className={`flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 text-[length:var(--font-sm)] font-medium transition-colors duration-150 ${drawMode === "polygon" ? activeClass : inactiveClass}`}
      >
        <PolygonIcon active={drawMode === "polygon"} />
        {t("heatMap.drawPolygon")}
      </button>

      {hasSelection && (
        <Button
          variant={EButtonVariant.SECONDARY}
          onClick={onClear}
          className="flex items-center gap-2 px-3 py-2 text-[length:var(--font-sm)]"
        >
          <ClearIcon />
          {t("heatMap.clearSelection")}
        </Button>
      )}

      {drawMode !== "none" && (
        <span className="text-[length:var(--font-sm)] text-[var(--color-text-secondary)] italic">
          {drawMode === "polygon" ? t("heatMap.drawingPolygon") : t("heatMap.drawing")}
        </span>
      )}

      {onExportCSV !== undefined && onExportPNG !== undefined && (
        <div className="ml-auto">
          <ExportMenu onExportCSV={onExportCSV} onExportPNG={onExportPNG} />
        </div>
      )}
    </div>
  );
}
