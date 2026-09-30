import { useContext } from "react";
import { DataUpdateContext } from "../DataUpdateContext";

/** The page's latest data update and whether it is loading one. */
export function useDataUpdate() {
  return useContext(DataUpdateContext);
}
