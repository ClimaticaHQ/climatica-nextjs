"use client";

import { SwapIcon } from "@/components/svg";
import { useState } from "react";
import { SWAP_BUTTON_CLASSES as C, SWAP_ICON_TURN_DEG } from "./SwapButton.constant";
import type { TSwapButtonProps } from "./SwapButton.type";

/** An icon button exchanging two sides — Period A and B, or the two years side by side. */
export function SwapButton({ label, onClick, isInline = false, className = "" }: TSwapButtonProps) {
  const [turns, setTurns] = useState(0);

  const handleClick = () => {
    setTurns((count) => count + 1);
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={`${isInline ? C.INLINE : C.DEFAULT} ${className}`}
    >
      <span
        className={C.ICON}
        style={{ transform: `rotate(${turns * SWAP_ICON_TURN_DEG}deg)` }}
        aria-hidden="true"
      >
        <SwapIcon />
      </span>
    </button>
  );
}
