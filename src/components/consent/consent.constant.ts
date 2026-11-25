import { EXTERNAL_LINK_CLASS, EXTERNAL_LINK_TARGET_CLASS } from "@/components/UI/ExternalLink";

export const CONSENT_CLASSES = {
  BANNER:
    "fixed inset-x-0 bottom-0 z-[1050] border-t border-[var(--color-border)] bg-[var(--color-surface)] pt-3 pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(0.75rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-[28rem] lg:rounded-[var(--radius-md)] lg:border lg:p-4",
  TEXT: "text-[length:var(--font-touch-secondary)] leading-snug text-[var(--color-text)] lg:text-[length:var(--font-base)]",
  LINK: `${EXTERNAL_LINK_CLASS} ${EXTERNAL_LINK_TARGET_CLASS}`,
  ACTIONS: "mt-3 grid grid-cols-2 gap-3",
  BUTTON:
    "min-h-11 px-4 text-[length:var(--font-touch-button)] lg:min-h-9 lg:text-[length:var(--font-base)]",
} as const;
