import { BOTTOM_SHEET_CLASSES } from "@/constants";
import type { TBottomSheetBackdropProps } from "./BottomSheet.type";

/** The dimmed page behind a sheet; a tap on it closes the sheet. */
export function BottomSheetBackdrop({ isLeaving, onClick }: TBottomSheetBackdropProps) {
  const animation = isLeaving ? "sheet-backdrop-out" : "sheet-backdrop-in";
  return (
    <div
      aria-hidden="true"
      data-testid="bottom-sheet-backdrop"
      className={`${BOTTOM_SHEET_CLASSES.BACKDROP} ${animation}`}
      onClick={onClick}
    />
  );
}
