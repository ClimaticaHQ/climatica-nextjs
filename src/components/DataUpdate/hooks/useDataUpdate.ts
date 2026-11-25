import { useContext } from "react";
import { DataUpdateContext } from "../DataUpdateContext";

export function useDataUpdate() {
  return useContext(DataUpdateContext);
}
