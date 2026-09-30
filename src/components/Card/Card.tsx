"use client";

import { useUpdateFlash } from "@/components/DataUpdate";
import { NO_FLASH_KEYS } from "@/constants";
import { useSettingsStore } from "@/stores";
import type { TCardProps } from "./Card.type";
import { getCardClassName } from "./Card.util";

/**
 * Every framed surface: border, radius, background, padding and elevation from typed variants,
 * and the update flash (in the chosen variant) when one of its series' data changes.
 */
export function Card({
  size,
  padding,
  elevation,
  background,
  flashKeys = NO_FLASH_KEYS,
  shouldClip,
  isFlatBelowSm,
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
        elevation,
        background,
        shouldClip,
        isFlatBelowSm,
        className,
      })}
    >
      {children}
    </div>
  );
}
