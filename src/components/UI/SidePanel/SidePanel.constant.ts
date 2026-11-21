// * the app's left panel from lg (hidden below): a fixed width under the top bar, a right
// * border, its body scrolling on its own above an optional fixed footer
export const SIDE_PANEL_CLASSES = {
  ROOT: "hidden w-80 shrink-0 flex-col overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:flex",
  BODY: "flex flex-1 flex-col gap-8 overflow-y-auto p-4",
  FOOTER: "shrink-0 border-t border-[var(--color-border)] p-4",
} as const;
