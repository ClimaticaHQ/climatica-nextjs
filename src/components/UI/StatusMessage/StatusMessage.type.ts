import type { EStatusMessageVariant } from "@/enums";

export type TStatusMessageProps = {
  variant: EStatusMessageVariant;
  /** already translated — never an error's own text */
  message: string;
  /** the text follows the locale and may differ from the server's */
  suppressHydrationWarning?: boolean;
  /** a notice by its control (search, location), closed by the reader */
  onDismiss?: () => void;
};
