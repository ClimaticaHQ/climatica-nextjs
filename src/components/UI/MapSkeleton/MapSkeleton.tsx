import type { TMapSkeletonProps } from "./MapSkeleton.type";

const TILE_OPACITIES = [50, 30, 50, 30, 50, 30, 50, 30, 50] as const;

export function MapSkeleton({ variant = "full", heightClassName }: TMapSkeletonProps) {
  const isMini = variant === "mini";
  const height = isMini ? "h-full" : (heightClassName ?? "h-[400px]");

  return (
    <div
      className={
        isMini
          ? `relative w-full animate-pulse overflow-hidden bg-[var(--color-bg-secondary)] ${height}`
          : `relative z-0 w-full animate-pulse overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-md ${height}`
      }
    >
      {/* Tile grid */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px bg-[var(--color-bg)]">
        {TILE_OPACITIES.map((opacity, i) => (
          <div key={i} className="bg-[var(--color-border)]" style={{ opacity: opacity / 100 }} />
        ))}
      </div>

      {/* City marker pin */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-3 w-3 rounded-full bg-[var(--color-primary)]" />
      </div>

      {/* Zoom controls — full variant only */}
      {!isMini && (
        <div className="absolute left-2 top-2 flex flex-col gap-px">
          <div className="h-7 w-7 rounded-sm bg-[var(--color-border)] opacity-60" />
          <div className="h-7 w-7 rounded-sm bg-[var(--color-border)] opacity-60" />
        </div>
      )}

      {/* Attribution bar */}
      <div className="absolute bottom-1 right-1.5">
        <div className="h-3 w-28 rounded bg-[var(--color-border)] opacity-40" />
      </div>
    </div>
  );
}
