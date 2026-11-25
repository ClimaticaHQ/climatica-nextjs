"use client";

import { Button } from "@/components/UI";
import { EButtonVariant } from "@/enums";
import { useAnalyticsConsent } from "@/hooks/persisted/useAnalyticsConsent";
import type { TCookieSettingsButtonProps } from "./consent.type";

/** only the consent wiring: the server-rendered Info footer can't hand Button an onClick */
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
