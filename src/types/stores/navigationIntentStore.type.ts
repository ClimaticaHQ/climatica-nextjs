/** Where an in-flight link navigation is going — so pages don't rewrite their URL meanwhile. */
export type TNavigationIntentState = {
  /** the target's browser path; null when no navigation is pending */
  pendingPathname: string | null;
  setPendingPathname: (pathname: string | null) => void;
};
