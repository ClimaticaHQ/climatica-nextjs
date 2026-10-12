import { useId } from "react";
import type { TToggleSwitchProps } from "./ToggleSwitch.type";

export function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
  isDisabled = false,
}: TToggleSwitchProps) {
  const descriptionId = useId();

  return (
    <label
      className={`flex items-center justify-between gap-4 ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span
          className={`text-[length:var(--font-sm)] text-[var(--color-text)] ${isDisabled ? "opacity-50" : ""}`}
        >
          {label}
        </span>
        {description !== undefined && (
          <span
            id={descriptionId}
            className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]"
          >
            {description}
          </span>
        )}
      </span>
      <div className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={isDisabled}
          aria-describedby={description === undefined ? undefined : descriptionId}
          className="peer sr-only"
        />
        <div className="h-5 w-9 rounded-full bg-[var(--color-border)] transition-colors duration-150 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform after:duration-150 after:content-[''] peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-4 peer-disabled:opacity-50" />
      </div>
    </label>
  );
}
