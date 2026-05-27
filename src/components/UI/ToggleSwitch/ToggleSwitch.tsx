import type { TToggleSwitchProps } from "./ToggleSwitch.type";

export function ToggleSwitch({ label, checked, onChange }: TToggleSwitchProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-[length:var(--font-sm)] text-[var(--color-text-secondary)]">
        {label}
      </span>
      <div className="relative inline-flex shrink-0">
        <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
        <div className="h-5 w-9 rounded-full bg-[var(--color-border)] transition-colors duration-150 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform after:duration-150 after:content-[''] peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-4" />
      </div>
    </label>
  );
}
