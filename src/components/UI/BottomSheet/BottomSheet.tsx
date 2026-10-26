"use client";

import {
  BOTTOM_SHEET_CLASSES as C,
  BOTTOM_SHEET_HEIGHT_CLASSES,
  BOTTOM_SHEET_SWIPE_CLOSE_PX,
  MOTION,
} from "@/constants";
import { EBottomSheetHeight } from "@/enums";
import { useBodyScrollLock } from "@/hooks/ui/useBodyScrollLock";
import { useFocusTrap } from "@/hooks/ui/useFocusTrap";
import { useIsClient } from "@/hooks/ui/useIsClient";
import { useMotionPreference } from "@/hooks/ui/useMotionPreference";
import { usePresence } from "@/hooks/ui/usePresence";
import { useSwipeToClose } from "@/hooks/ui/useSwipeToClose";
import { type KeyboardEvent, useId, useRef } from "react";
import { createPortal } from "react-dom";
import type { TBottomSheetProps } from "./BottomSheet.type";
import { BottomSheetBackdrop } from "./BottomSheetBackdrop";
import { BottomSheetHandle } from "./BottomSheetHandle";
import { BottomSheetHeader } from "./BottomSheetHeader";

/**
 * A modal panel sliding up from the bottom edge, rendered into <body>. Escape, the backdrop,
 * the close button and a swipe down on its header ask it to close (onClose); the owner closes
 * it by setting isOpen. It knows nothing about what it shows — pair it with useSheetHistory.
 */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  height = EBottomSheetHeight.AUTO,
  footer,
  children,
}: TBottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const isClient = useIsClient();
  const isActive = isOpen && isClient;
  const { isMotionEnabled } = useMotionPreference();
  const { isPresent, isLeaving } = usePresence(isOpen, isMotionEnabled ? MOTION.SHEET_SLIDE_MS : 0);
  // * a sheet on its way out ignores further close requests
  const requestClose = () => {
    if (isOpen) onClose();
  };
  const swipe = useSwipeToClose({
    isEnabled: isOpen,
    thresholdPx: BOTTOM_SHEET_SWIPE_CLOSE_PX,
    onClose: requestClose,
  });
  useFocusTrap({ containerRef: panelRef, isActive });
  useBodyScrollLock(isActive);

  if (!isClient || !isPresent) return null;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    requestClose();
  }

  const animation = isLeaving ? "sheet-slide-out" : "sheet-slide-in";
  const snapBack = swipe.isDragging ? "" : "sheet-snap-back";

  return createPortal(
    <div className={C.LAYER}>
      <BottomSheetBackdrop isLeaving={isLeaving} onClick={requestClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`${C.PANEL} ${BOTTOM_SHEET_HEIGHT_CLASSES[height]} ${animation} ${snapBack}`}
        style={swipe.offset > 0 ? { transform: `translateY(${swipe.offset}px)` } : undefined}
      >
        <div className={C.DRAG_ZONE} {...swipe.handlers}>
          <BottomSheetHandle />
          <BottomSheetHeader title={title} titleId={titleId} onClose={requestClose} />
        </div>
        <div className={C.CONTENT}>{children}</div>
        {footer !== undefined && <div className={C.FOOTER}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
