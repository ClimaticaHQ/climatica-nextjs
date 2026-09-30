import type { ECardBackground, ECardElevation, ECardPadding, ECardSize } from "@/enums";
import type { TUpdateFlashKeys } from "@/types";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type TCardProps = Omit<ComponentPropsWithoutRef<"div">, "className" | "style"> & {
  size?: ECardSize | undefined;
  padding?: ECardPadding | undefined;
  elevation?: ECardElevation | undefined;
  background?: ECardBackground | undefined;
  /** the series whose data updates flash the card; none by default */
  flashKeys?: TUpdateFlashKeys | undefined;
  /** clip the content to the rounded corners (tables, bars, the map, the progress bar) */
  shouldClip?: boolean | undefined;
  /** below `sm` the card drops its frame: its content sits on the page background */
  isFlatBelowSm?: boolean | undefined;
  /** layout only (grid, spacing, positioning) — the card's frame comes from the props above */
  className?: string | undefined;
  children: ReactNode;
};

export type TCardClassArgs = Pick<
  TCardProps,
  "size" | "padding" | "elevation" | "background" | "shouldClip" | "isFlatBelowSm" | "className"
>;
