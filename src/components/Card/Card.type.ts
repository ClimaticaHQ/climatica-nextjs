import type { ECardBackground, ECardPadding, ECardSize } from "@/enums";
import type { TUpdateFlashKeys } from "@/types";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type TCardProps = Omit<ComponentPropsWithoutRef<"div">, "className" | "style"> & {
  size?: ECardSize | undefined;
  padding?: ECardPadding | undefined;
  background?: ECardBackground | undefined;
  flashKeys?: TUpdateFlashKeys | undefined;
  shouldClip?: boolean | undefined;
  className?: string | undefined;
  children: ReactNode;
};

export type TCardClassArgs = Pick<
  TCardProps,
  "size" | "padding" | "background" | "shouldClip" | "className"
>;
