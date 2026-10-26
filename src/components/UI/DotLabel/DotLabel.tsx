import { OptionMarker } from "../Dropdown/OptionMarker";
import type { TDotLabelProps } from "./DotLabel.type";

/** A label, with an entity's shape before it when it names one. */
export function DotLabel({ label, markerShape }: TDotLabelProps) {
  return (
    <div className="flex items-center gap-2">
      {markerShape && <OptionMarker shape={markerShape} />}
      <span className="text-[length:var(--font-sm)] font-medium text-[var(--color-text-secondary)]">
        {label}
      </span>
    </div>
  );
}
