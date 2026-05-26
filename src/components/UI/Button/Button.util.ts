import { EButtonVariant } from "@/enums";

const BUTTON_VARIANT_STYLES: Record<EButtonVariant, string> = {
  [EButtonVariant.PRIMARY]:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-dark)] disabled:cursor-not-allowed disabled:opacity-50",
  [EButtonVariant.SECONDARY]:
    "border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50",
  [EButtonVariant.GHOST]:
    "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50",
};

export function getButtonVariantStyles(variant: EButtonVariant): string {
  return BUTTON_VARIANT_STYLES[variant];
}
