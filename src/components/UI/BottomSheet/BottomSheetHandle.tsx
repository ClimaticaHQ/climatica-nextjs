/** The grab bar at a sheet's top edge — a visual cue for dragging it down. */
export function BottomSheetHandle() {
  return (
    <div className="flex justify-center pb-1 pt-2" aria-hidden="true">
      <span className="h-1 w-10 rounded-[var(--radius-full)] bg-[var(--color-border)]" />
    </div>
  );
}
