import { EStatusMessageVariant } from "@/enums";

export const STATUS_MESSAGE_CLASSES = {
  [EStatusMessageVariant.EMPTY]: "text-center text-[var(--color-text-secondary)]",
  [EStatusMessageVariant.ERROR]:
    "rounded-[var(--radius-md)] border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-center text-[var(--color-error)]",
} as const satisfies Record<EStatusMessageVariant, string>;

// * a notice by its control, compact and closable
export const DISMISSIBLE_MESSAGE_CLASSES = {
  ROOT: "flex items-start gap-2 rounded-[var(--radius-sm)] border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-3 py-2",
  TEXT: "flex-1 text-[length:var(--font-sm)] text-[var(--color-error)]",
  CLOSE: "shrink-0 text-[var(--color-error)] opacity-60 transition-opacity hover:opacity-100",
} as const;

// * an error is announced as it appears; an empty result is just text
export const STATUS_MESSAGE_ROLES = {
  [EStatusMessageVariant.EMPTY]: undefined,
  [EStatusMessageVariant.ERROR]: "alert",
} as const satisfies Record<EStatusMessageVariant, string | undefined>;
