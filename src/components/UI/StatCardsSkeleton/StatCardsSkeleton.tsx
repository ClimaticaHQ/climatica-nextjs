import { Card } from "@/components/Card";
import { ECardPadding, ECardSize } from "@/enums";
import type { TStatCardsSkeletonProps } from "./StatCardsSkeleton.type";

export function StatCardsSkeleton({ count = 4 }: TStatCardsSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          size={ECardSize.MD}
          padding={ECardPadding.COMPACT}
          className="flex animate-pulse flex-col gap-2"
        >
          <div className="h-3 w-20 rounded bg-[var(--color-border)]" />
          <div className="h-9 w-28 rounded bg-[var(--color-border)]" />
        </Card>
      ))}
    </div>
  );
}
