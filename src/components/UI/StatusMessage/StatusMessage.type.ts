import type { EStatusMessageVariant } from "@/enums";

export type TStatusMessageProps = {
  variant: EStatusMessageVariant;
  message: string;
  /** the text follows the locale and may differ from the server's */
  suppressHydrationWarning?: boolean;
  onDismiss?: () => void;
};
