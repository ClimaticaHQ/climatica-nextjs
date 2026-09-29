import { PANEL_CARD_CLASS, PANEL_CARD_ROWS_CLASS } from "./PanelCard.constant";
import type { TPanelCardProps } from "./PanelCard.type";

/**
 * Card around one panel of a split comparison. Its child must itself span the two rows
 * (header, plot) — e.g. WalterLiethChart with isPanel — to keep the row alignment.
 */
export function PanelCard({ children }: TPanelCardProps) {
  return <div className={`${PANEL_CARD_CLASS} ${PANEL_CARD_ROWS_CLASS}`}>{children}</div>;
}
