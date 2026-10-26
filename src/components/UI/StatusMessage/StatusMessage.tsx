import { CloseIcon } from "@/components/svg";
import { useTranslations } from "next-intl";
import {
  DISMISSIBLE_MESSAGE_CLASSES as D,
  STATUS_MESSAGE_CLASSES,
  STATUS_MESSAGE_ROLES,
} from "./StatusMessage.constant";
import type { TStatusMessageProps } from "./StatusMessage.type";

/**
 * A page's empty or error message — the one way every page shows either. With onDismiss, a
 * compact notice by its control that the reader can close.
 */
export function StatusMessage({
  variant,
  message,
  suppressHydrationWarning,
  onDismiss,
}: TStatusMessageProps) {
  const t = useTranslations();

  if (onDismiss) {
    return (
      <div role={STATUS_MESSAGE_ROLES[variant]} className={D.ROOT}>
        <p className={D.TEXT}>{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t("common.close")}
          className={D.CLOSE}
        >
          <CloseIcon />
        </button>
      </div>
    );
  }

  return (
    <p
      role={STATUS_MESSAGE_ROLES[variant]}
      className={STATUS_MESSAGE_CLASSES[variant]}
      suppressHydrationWarning={suppressHydrationWarning}
    >
      {message}
    </p>
  );
}
