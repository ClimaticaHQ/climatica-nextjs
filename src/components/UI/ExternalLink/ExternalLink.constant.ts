import { FOCUS_RING_CLASS } from "@/constants";

// * an inline link to another site: primary, underlined
export const EXTERNAL_LINK_CLASS = `${FOCUS_RING_CLASS} rounded-[var(--radius-xs)] font-medium text-[var(--color-primary)] underline underline-offset-2 hover:text-[var(--color-primary-hover)]`;

// * every link in that look, and every external link whatever its look: a 44px target below lg
export const EXTERNAL_LINK_TARGET_CLASS = "touch-target";
