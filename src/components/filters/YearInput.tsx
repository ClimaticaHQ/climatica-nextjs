import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { FORM_CONTROL_CLASSES } from "@/constants";
import { YEAR_INPUT_CLASS } from "./filters.constant";
import type { TYearInputProps } from "./filters.type";

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

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setRaw(next);
    const parsed = parseInt(next, 10);
    if (!isNaN(parsed)) onChange(parsed);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") onEnter?.();
  }

  return (
    <label className={FORM_CONTROL_CLASSES.FIELD_TARGET}>
      <input
        type="number"
        value={raw}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={YEAR_INPUT_CLASS}
      />
    </label>
  );
}
