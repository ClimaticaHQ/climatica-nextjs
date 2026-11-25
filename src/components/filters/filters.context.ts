import { createContext } from "react";
import type { TFilterUnavailableActions } from "./filters.type";

export const FilterSectionTitleContext = createContext(true);

export const FilterUnavailableActionsContext = createContext<TFilterUnavailableActions>({});
