import { createContext } from "react";
import type { TFilterUnavailableActions } from "./filters.type";

/** Whether sections show their own title — a sheet titled with the filter's name hides them. */
export const FilterSectionTitleContext = createContext(true);

/**
 * The ways out of a disabling reason, given by where the sections are rendered (sidebar, full
 * sheet). A reason without one — or rendered outside a provider — shows its note alone.
 */
export const FilterUnavailableActionsContext = createContext<TFilterUnavailableActions>({});
