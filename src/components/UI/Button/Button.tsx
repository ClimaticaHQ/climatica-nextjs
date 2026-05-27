import { getButtonVariantStyles } from "./Button.util";
import type { TButtonProps } from "./Button.type";

export function Button({
  variant,
  children,
  onClick,
  disabled,
  type = "button",
  className,
  ariaLabel,
}: TButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`rounded-[var(--radius-sm)] font-medium transition-colors duration-150 ${getButtonVariantStyles(variant)}${className ? ` ${className}` : ""}`}
    >
      {children}
    </button>
  );
}
