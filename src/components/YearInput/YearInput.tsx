import { useEffect, useState } from "react";
import type { TYearInputProps } from "./YearInput.type";

export function YearInput({
  value,
  min,
  max,
  onChange,
  placeholder,
  onEnter,
  disabled,
}: TYearInputProps) {
  const [raw, setRaw] = useState(() => (value !== undefined ? String(value) : ""));

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setRaw(value !== undefined ? String(value) : "");
  }, [value]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setRaw(next);
    const parsed = parseInt(next, 10);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") onEnter?.();
  }

  return (
    <input
      type="number"
      value={raw}
      min={min}
      max={max}
      placeholder={placeholder}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className="w-full rounded-[var(--radius-md)] border-2 border-[var(--color-border)] px-3 py-2 text-[length:var(--font-base)] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
