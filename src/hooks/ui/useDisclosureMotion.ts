"use client";

import { MOTION } from "@/constants";
import { useRef, useState, type MouseEvent } from "react";
import { useMotionPreference } from "./useMotionPreference";

/**
 * A <details> that folds instead of jumping: on its summary's click its content's height and
 * opacity animate (MOTION.ACCORDION_MS, the indicators' easing), and it closes only once folded.
 * A click mid-way reverses the running animation from where it is. Anything else that opens or
 * closes it (find-in-page, a script, motion off) stays native; `isExpanded` follows it.
 */
export function useDisclosureMotion() {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  // * where it's heading: the chevron's state, and what a finished fold leaves
  const isExpandedRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isMotionEnabled } = useMotionPreference();

  const setExpanded = (value: boolean) => {
    isExpandedRef.current = value;
    setIsExpanded(value);
  };

  const settle = (animation: Animation) => {
    if (animationRef.current !== animation) return;
    animationRef.current = null;
    if (!isExpandedRef.current && detailsRef.current) detailsRef.current.open = false;
    // * its height back to the content's own
    animation.cancel();
  };

  function handleSummaryClick(event: MouseEvent<HTMLElement>) {
    const details = detailsRef.current;
    const content = contentRef.current;
    if (!isMotionEnabled || !details || !content) return;
    event.preventDefault();
    const willOpen = !isExpandedRef.current;
    setExpanded(willOpen);
    if (animationRef.current) {
      animationRef.current.reverse();
      return;
    }
    if (willOpen) details.open = true;
    const shut = { height: "0px", opacity: 0, overflow: "hidden" };
    const shown = { height: `${content.scrollHeight}px`, opacity: 1, overflow: "hidden" };
    const animation = content.animate(willOpen ? [shut, shown] : [shown, shut], {
      duration: MOTION.ACCORDION_MS,
      easing: MOTION.INDICATOR_SLIDE_EASING,
      fill: "forwards",
    });
    animationRef.current = animation;
    animation.onfinish = () => settle(animation);
  }

  function handleToggle() {
    if (animationRef.current || !detailsRef.current) return;
    setExpanded(detailsRef.current.open);
  }

  return { detailsRef, contentRef, isExpanded, handleSummaryClick, handleToggle };
}
