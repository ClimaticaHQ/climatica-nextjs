import Link from "next/link";
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
  href,
}: TButtonProps) {
  const classes = `rounded-[var(--radius-sm)] font-medium transition-colors duration-150 ${getButtonVariantStyles(variant)}${className ? ` ${className}` : ""}`;

  if (href !== undefined) {
    return (
      <Link
        href={href}
        {...(onClick ? { onClick } : {})}
        aria-label={ariaLabel}
        className={classes}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={classes}
    >
      {children}
    </button>
  );
}
