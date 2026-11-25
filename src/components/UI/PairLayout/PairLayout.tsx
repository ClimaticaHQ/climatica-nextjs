import { PAIR_LAYOUT_CLASSES } from "./PairLayout.constant";
import type { TPairLayoutProps } from "./PairLayout.type";

export function PairLayout({ variant, first, second, between }: TPairLayoutProps) {
  const C = PAIR_LAYOUT_CLASSES[variant];
  return (
    <div className={between === undefined ? C.ROOT : C.ROOT_WITH_BETWEEN}>
      {first}
      {between !== undefined && <div className={C.BETWEEN}>{between}</div>}
      {second}
    </div>
  );
}
