"use client";

import { Button } from "@/components/UI";
import { EButtonVariant } from "@/enums";
import { useAnalyticsConsent } from "@/hooks/persisted/useAnalyticsConsent";
import type { TCookieSettingsButtonProps } from "./consent.type";

/**
 * Cookie settings: a link-look Button reopening the consent banner. Only the consent wiring
 * lives here, for the server-rendered Info footer, which can't hand Button an onClick.
 */
export function CookieSettingsButton({
  children,
  className,
  fallback = null,
}: TCookieSettingsButtonProps) {
  const { isAvailable, openBanner } = useAnalyticsConsent();
  if (!isAvailable) return fallback;

  return (
    <Button variant={EButtonVariant.LINK} onClick={openBanner} className={className}>
      {children}
    </Button>
  );
}
