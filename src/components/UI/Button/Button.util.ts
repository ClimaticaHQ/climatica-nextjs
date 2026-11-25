import { EXTERNAL_LINK_CLASS, EXTERNAL_LINK_TARGET_CLASS } from "@/components/UI/ExternalLink";
import { FORM_CONTROL_CLASSES } from "@/constants";
import { EButtonVariant } from "@/enums";

const BOX = "rounded-[var(--radius-sm)]";

const BUTTON_VARIANT_STYLES: Record<EButtonVariant, string> = {
  [EButtonVariant.PRIMARY]: `${BOX} bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50`,
  [EButtonVariant.SECONDARY]: `${BOX} ${FORM_CONTROL_CLASSES.OUTLINE} disabled:cursor-not-allowed disabled:opacity-50`,
  [EButtonVariant.GHOST]: `${BOX} text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50`,
  [EButtonVariant.LINK]: `${EXTERNAL_LINK_CLASS} ${EXTERNAL_LINK_TARGET_CLASS} cursor-pointer`,
};

export function getButtonVariantStyles(variant: EButtonVariant): string {
  return BUTTON_VARIANT_STYLES[variant];
}
