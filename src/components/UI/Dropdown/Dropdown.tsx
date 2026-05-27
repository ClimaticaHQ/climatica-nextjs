import { useEffect, useRef, useState } from "react";
import { TDropdownProps } from "./Dropdown.type";

export default function Dropdown({
  options,
  value,
  onChange,
  className,
  "data-testid": testId,
  optionTestIdPrefix,
}: TDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        data-testid={testId}
        onClick={() => setIsOpen((o) => !o)}
        className={`
          flex items-center gap-2 px-3 py-1.5
          rounded-[var(--radius-sm)] text-[length:var(--font-base)] md:text-[length:var(--font-sm)]
          border border-[var(--color-border)]
          text-[var(--color-text-secondary)] hover:text-[var(--color-text)]
          hover:bg-[var(--color-bg-secondary)]
          transition-colors duration-150
        `}
      >
        <span>{selected?.label}</span>
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
        className={`
          absolute right-0 top-full mt-1 min-w-full z-50
          bg-[var(--color-bg)] border border-[var(--color-border)]
          rounded-[var(--radius-sm)] shadow-md overflow-hidden
          transition-all duration-200 origin-top
          ${isOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"}
        `}
      >
        {options.map((option) => (
          <button
            key={option.value}
            data-testid={optionTestIdPrefix ? `${optionTestIdPrefix}-${option.value}` : undefined}
            disabled={option.disabled}
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
                  ? "cursor-not-allowed opacity-40 text-[var(--color-text-secondary)]"
                  : option.value === value
                    ? "bg-[var(--color-primary)] text-[var(--color-bg)]"
                    : "text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
