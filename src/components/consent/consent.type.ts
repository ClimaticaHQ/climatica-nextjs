import type { ReactNode } from "react";

export type TConsentBannerProps = {
  onAccept: () => void;
  onReject: () => void;
};

export type TCookieSettingsButtonProps = {
  children: ReactNode;
  className?: string | undefined;
  /** shown instead when there are no analytics to choose about (no measurement ID) */
  fallback?: ReactNode;
};

export type TGoogleAnalyticsScriptsProps = {
  gaId: string;
};
