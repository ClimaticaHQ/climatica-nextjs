import { EFilterAvailability } from "@/enums";
import type { TFilterUnavailableActionLabels, TFilterUnavailableActions } from "@/types";
import { getSwitchToStandardChartLabel } from "@/utils/chartMode.util";
import { createContext } from "react";

/**
 * The ways out of a disabling reason, given by where the sections are rendered (sidebar, full
 * sheet). A reason without one — or rendered outside a provider — shows its note alone.
 */
export const FilterUnavailableActionsContext = createContext<TFilterUnavailableActions>({});

export const FILTER_UNAVAILABLE_ACTION_LABELS: TFilterUnavailableActionLabels = {
  [EFilterAvailability.WALTER_LIETH]: getSwitchToStandardChartLabel,
};

export const FILTER_UNAVAILABLE_ACTION_CLASS =
  "mt-1 inline-flex items-center text-[length:var(--font-xs)] font-medium text-[var(--color-primary)] underline-offset-2 hover:underline max-lg:min-h-11";
