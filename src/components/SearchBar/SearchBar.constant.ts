import { FORM_CONTROL_CLASSES } from "@/constants";

// * where the results would open: the search's failure, in the error colours
export const SEARCH_ERROR_CLASS =
  "absolute top-[calc(100%+4px)] left-0 right-0 z-[1000] rounded-[var(--radius-lg)] border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-2 text-[length:var(--font-sm)] text-[var(--color-error)] shadow-md";

// * the shared text field; the search reads a size larger from `md`
export const SEARCH_INPUT_CLASS = `${FORM_CONTROL_CLASSES.INPUT} text-[length:var(--font-sm)] md:px-4 md:text-[length:var(--font-md)]`;
