import { DATA_UPDATE_CLASSES as C } from "../DataUpdate.constant";
import { useDataUpdate } from "../hooks";

/**
 * An indeterminate bar along the top edge of its (relative) card while an update loads. The
 * card clips it to its rounded corners.
 */
export function DataUpdateProgress() {
  const { isLoading } = useDataUpdate();
  if (!isLoading) return null;

  return (
    <div aria-hidden data-update-progress className={C.PROGRESS_TRACK}>
      <div className={C.PROGRESS_SEGMENT} />
    </div>
  );
}
