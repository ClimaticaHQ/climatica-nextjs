import { DATA_UPDATE_CLASSES as C } from "../DataUpdate.constant";
import type { TDataUpdateFadeProps } from "../DataUpdate.type";
import { useDataUpdate } from "../hooks";

export function DataUpdateFade({ isFullHeight = false, children }: TDataUpdateFadeProps) {
  const { isLoading } = useDataUpdate();

  return (
    <div aria-busy={isLoading} className={`${C.FADE} ${isFullHeight ? C.FULL_HEIGHT : ""}`}>
      {children}
    </div>
  );
}
