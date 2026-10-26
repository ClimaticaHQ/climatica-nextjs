import { FORM_CONTROL_CLASSES } from "@/constants";
import { useEffect, useId, useRef, useState } from "react";
import { TDropdownProps } from "./Dropdown.type";
import { OptionMarker } from "./OptionMarker";

export default function Dropdown({
  options,
  value,
  onChange,
  className,
  "data-testid": testId,
  optionTestIdPrefix,
  ariaLabelledBy,
  isStretched = false,
}: TDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const activeOption = listRef.current.querySelector<HTMLButtonElement>(
      `[data-value="${value}"]`,
    );
    activeOption?.scrollIntoView({ block: "nearest" });
  }, [isOpen, value]);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        data-testid={testId}
        onClick={() => setIsOpen((o) => !o)}
        id={buttonId}
        // * named by its label, then its value: "Period A 1970–2000"
        aria-labelledby={ariaLabelledBy === undefined ? undefined : `${ariaLabelledBy} ${buttonId}`}
        aria-expanded={isOpen}
        className={`
          ${isStretched ? "w-full justify-between" : ""}
          flex items-center gap-2 px-3 py-1.5
          ${FORM_CONTROL_CLASSES.FRAME} ${FORM_CONTROL_CLASSES.BORDER_COLOR} ${FORM_CONTROL_CLASSES.HOVER}
          text-[length:var(--font-base)] md:text-[length:var(--font-sm)]
          text-[var(--color-text-secondary)]
          transition-colors duration-150
        `}
      >
        <span className="inline-flex items-center gap-1.5">
          {selected?.markerShape !== undefined && <OptionMarker shape={selected.markerShape} />}
          {selected?.label}
        </span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div
        ref={listRef}
        className={`
          absolute right-0 top-full mt-1 min-w-full z-50
          max-h-[7rem] overflow-y-auto overscroll-contain
          bg-[var(--color-surface)] border border-[var(--color-border)]
          rounded-[var(--radius-sm)] shadow-md
          transition-all duration-200 origin-top
          ${isOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"}
        `}
      >
        {options.map((option) => (
          <button
            key={option.value}
            data-value={option.value}
            data-testid={optionTestIdPrefix ? `${optionTestIdPrefix}-${option.value}` : undefined}
            disabled={option.disabled}
            aria-describedby={
              option.description !== undefined ? `${buttonId}-${option.value}-desc` : undefined
            }
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
            className={`
              block w-full text-left px-3 py-2
              text-[length:var(--font-base)]
              transition-colors duration-100
              ${
                option.disabled
                  ? "cursor-not-allowed text-[var(--color-text-secondary)]"
                  : option.value === value
                    ? "bg-[var(--color-primary)] text-[var(--color-surface)]"
                    : "text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)]"
              }
            `}
          >
            {/* * a disabled option's label fades; its description stays readable */}
            <span
              className={`inline-flex items-center gap-1.5 ${option.disabled ? "opacity-40" : ""}`}
            >
              {option.markerShape !== undefined && <OptionMarker shape={option.markerShape} />}
              {option.label}
            </span>
            {option.description !== undefined && (
              <span
                id={`${buttonId}-${option.value}-desc`}
                className="block text-[length:var(--font-xs)] text-[var(--color-text-secondary)]"
              >
                {option.description}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
