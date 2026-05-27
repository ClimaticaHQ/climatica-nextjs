import { DotLabel } from "@/components/UI";
import { useEffect, useState } from "react";
import type { TPeriodSelectRowProps } from "./PeriodSelectRow.type";

export function PeriodSelectRow({
  label,
  value,
  onChange,
  error,
  hint,
  hideDot = false,
  dotColor,
}: TPeriodSelectRowProps) {
  const [draft, setDraft] = useState(value);

  /* eslint-disable react-hooks/set-state-in-effect */
  /** Sync draft when the value is changed externally (e.g. programmatic reset) */
  useEffect(() => {
    setDraft(value);
  }, [value]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setDraft(raw);
    onChange(raw);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <DotLabel label={label} dotColor={dotColor ?? ""} hideDot={hideDot} />}

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={draft}
            onChange={handleChange}
            className={`w-24 rounded-[var(--radius-md)] border px-3 py-2 text-[length:var(--font-sm)] transition-all focus:outline-none focus:ring-2 ${
              error
                ? "border-[var(--color-error)] bg-[var(--color-error-bg)] focus:ring-[var(--color-error)]"
                : "border-[var(--color-border)] bg-[var(--color-bg)] focus:ring-[var(--color-primary)]"
            }`}
            aria-invalid={error !== undefined && error !== ""}
          />
          {hint !== undefined && hint !== "" && (
            <span className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
              {hint}
            </span>
          )}
        </div>

        {error !== undefined && error !== "" && (
          <span className="text-[length:var(--font-xs)] font-medium text-[var(--color-error)]">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
