import type { ReactNode } from "react";

export type TConsentBannerProps = {
  onAccept: () => void;
  onReject: () => void;
};

export type TCookieSettingsButtonProps = {
  children: ReactNode;
  className?: string | undefined;
  fallback?: ReactNode;
};

export type TGoogleAnalyticsScriptsProps = {
  gaId: string;
};
