import { BURGER_ICON_CLASSES as C } from "./svg.constant";
import type { TBurgerIconProps } from "./svg.type";

export function BurgerIcon({ isOpen }: TBurgerIconProps) {
  return (
    <span aria-hidden className={C.ROOT}>
      <span className={`${C.BAR} ${C.OUTER} ${isOpen ? C.TOP_OPEN : ""}`} />
      <span className={`${C.BAR} ${isOpen ? C.MIDDLE_OPEN : ""}`} />
      <span className={`${C.BAR} ${C.OUTER} ${isOpen ? C.BOTTOM_OPEN : ""}`} />
    </span>
  );
}
