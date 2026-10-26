import { NO_DATA_UPDATE } from "@/constants";
import type { TDataUpdateContext } from "@/types";
import { createContext } from "react";

// * outside a DataUpdateProvider: never loading, never an update — nothing fades or flashes
export const DataUpdateContext = createContext<TDataUpdateContext>({
  update: NO_DATA_UPDATE,
  isFresh: () => false,
  isLoading: false,
});
