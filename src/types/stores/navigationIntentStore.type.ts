/** so pages don't rewrite their URL while a link navigation is in flight */
export type TNavigationIntentState = {
  pendingPathname: string | null;
  setPendingPathname: (pathname: string | null) => void;
};
