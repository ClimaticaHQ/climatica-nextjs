import { FORM_CONTROL_CLASSES } from "@/constants";
import { EButtonVariant } from "@/enums";

const BUTTON_VARIANT_STYLES: Record<EButtonVariant, string> = {
  [EButtonVariant.PRIMARY]:
    "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50",
  // * an outline button: the form controls' frame and hover
  [EButtonVariant.SECONDARY]: `${FORM_CONTROL_CLASSES.OUTLINE} disabled:cursor-not-allowed disabled:opacity-50`,
  [EButtonVariant.GHOST]:
    "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50",
};

export function getButtonVariantStyles(variant: EButtonVariant): string {
  return BUTTON_VARIANT_STYLES[variant];
}
