/** The consent banner opened again from Cookie settings, while a choice is already stored. */
export type TConsentBannerState = {
  isReopened: boolean;
  reopen: () => void;
  close: () => void;
};
