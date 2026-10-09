import { Dropdown } from "@/components/UI";
import { useTranslations } from "next-intl";
import type { TCellSizeSelectorProps } from "./CellSizeSelector.type";

export function CellSizeSelector({
  activeSize,
  options,
  onSelect,
  isLabelHidden = false,
}: TCellSizeSelectorProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-1.5">
      {!isLabelHidden && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
          {t("climateStatistics.cellResolution")}
        </p>
      )}
      <Dropdown
        options={options.map(({ value, label, disabled, description }) => ({
          value,
          label,
          ...(disabled !== undefined ? { disabled } : {}),
          ...(description !== undefined ? { description } : {}),
        }))}
        value={activeSize}
        onChange={(v) => onSelect(v as typeof activeSize)}
        className="w-full"
      />
    </div>
  );
}
