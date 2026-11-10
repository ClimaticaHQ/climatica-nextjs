import { getSegmentsFitInline } from "@/utils/segmentedControl.util";
import { useLayoutEffect, useState, type RefObject } from "react";
import { SEGMENT_ICON_EM } from "../SegmentedControl.constant";

const px = (value: string) => parseFloat(value) || 0;

/** A label's width on one line, in the segment's own font: a hidden unwrapped copy beside it. */
function measureLabel(button: HTMLElement) {
  const probe = document.createElement("span");
  probe.textContent = button.textContent;
  probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;";
  button.append(probe);
  const { width } = probe.getBoundingClientRect();
  probe.remove();
  return width;
}

/** The most room the control can take: the nearest ancestor holding more than the control. */
function getRoom(track: HTMLElement) {
  let room = track.parentElement;
  while (room && (getComputedStyle(room).display === "contents" || room.childElementCount === 1)) {
    room = room.parentElement;
  }
  return room;
}

/**
 * Whether the options go in a vertical list: when one label doesn't fit on one line beside its
 * icon in an equal segment at the most room the control can take — decided for the whole control,
 * from widths alone (the room and the labels, never the control's own layout), so it can't
 * oscillate. Also that room's width, for the list to take it.
 */
export function useSegmentLayout(trackRef: RefObject<HTMLDivElement | null>, isEnabled: boolean) {
  const [layout, setLayout] = useState({ isList: false, roomWidth: 0 });

  // * before paint, so a control that doesn't fit inline never shows inline first
  useLayoutEffect(() => {
    const track = trackRef.current;
    const room = track ? getRoom(track) : null;
    if (!isEnabled || !track || !room) return;
    const measure = () => {
      const buttons = [...track.querySelectorAll("button")];
      const first = buttons[0];
      if (!first) return;
      const button = getComputedStyle(first);
      const trackStyle = getComputedStyle(track);
      const roomStyle = getComputedStyle(room);
      const icon = first.querySelector("svg") ? px(button.fontSize) * SEGMENT_ICON_EM : 0;
      const roomWidth = room.clientWidth - px(roomStyle.paddingLeft) - px(roomStyle.paddingRight);
      const fits = getSegmentsFitInline({
        labelWidths: buttons.map(measureLabel),
        segmentExtra:
          icon + px(button.columnGap) + px(button.paddingLeft) + px(button.paddingRight),
        availableWidth: roomWidth,
        trackExtra:
          px(trackStyle.paddingLeft) +
          px(trackStyle.paddingRight) +
          px(trackStyle.columnGap) * (buttons.length - 1),
      });
      // * the same answer keeps the same state: no render
      setLayout((previous) =>
        previous.isList === !fits && previous.roomWidth === roomWidth
          ? previous
          : { isList: !fits, roomWidth },
      );
    };
    measure();
    // * again whenever a web font arrives (it measures differently) or the text size changes
    document.fonts.addEventListener("loadingdone", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(room);
    observer.observe(document.documentElement);
    return () => {
      document.fonts.removeEventListener("loadingdone", measure);
      observer.disconnect();
    };
  }, [trackRef, isEnabled]);

  return layout;
}
