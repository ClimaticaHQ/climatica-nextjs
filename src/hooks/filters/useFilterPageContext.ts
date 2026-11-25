"use client";

import { FILTER_FALLBACK_VIEW } from "@/constants";
import { EFilterView } from "@/enums";
import { usePathname } from "next/navigation";
import type { TFilterPageContext } from "@/types";
import { parseHeatmapBoundsParams } from "@/utils/bbox.util";
import { isWalterLiethShown } from "@/utils/chartMode.util";
import { getFilterView } from "@/utils/filters.util";
import { useSearchParams } from "next/navigation";

export function useFilterPageContext(): TFilterPageContext {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = getFilterView(pathname) ?? FILTER_FALLBACK_VIEW;

  return {
    view,
    isWalterLieth: isWalterLiethShown({ pathname, searchParams }),
    heatmapBbox: view === EFilterView.HEAT_MAP ? parseHeatmapBoundsParams(searchParams) : null,
  };
}
