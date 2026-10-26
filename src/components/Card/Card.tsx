"use client";

import { useUpdateFlash } from "@/components/DataUpdate";
import { NO_FLASH_KEYS } from "@/constants";
import { useSettingsStore } from "@/stores";
import type { TCardProps } from "./Card.type";
import { getCardClassName } from "./Card.util";

/**
 * Every framed surface: border, radius, background and padding from typed variants, and the
 * update flash (in the chosen variant) when one of its series' data changes. No shadow: a card
 * sits in the page's flow — only floating layers (popovers, menus) cast one.
 */
export function Card({
  size,
  padding,
  background,
  flashKeys = NO_FLASH_KEYS,
  shouldClip,
  className,
  children,
  ...rest
}: TCardProps) {
  const flashVariant = useSettingsStore((state) => state.updateFlashVariant);
  const flashRef = useUpdateFlash<HTMLDivElement>(flashKeys, flashVariant);

  return (
    <div
      {...rest}
      ref={flashRef}
      className={getCardClassName({
        size,
        padding,
        background,
        shouldClip,
        className,
      })}
    >
      {children}
    </div>
  );
}
