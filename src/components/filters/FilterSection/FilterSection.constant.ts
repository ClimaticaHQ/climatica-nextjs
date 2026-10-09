import { createContext } from "react";

export const FILTER_SECTION_DIMMED_CLASS = "pointer-events-none opacity-40";

/** Whether sections show their own title — a sheet titled with the filter's name hides them. */
export const FilterSectionTitleContext = createContext(true);
