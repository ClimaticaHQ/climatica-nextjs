"use client";

import { usePathname } from "next/navigation";
import { useLastPageParamsStore } from "@/stores";
import { toPageRoute } from "@/utils/lastPageParams.util";
import { extractPageParams } from "@/utils/pageParams.util";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function useLastPageParamsSync() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setPageParams = useLastPageParamsStore((state) => state.setPageParams);

  useEffect(() => {
    const route = toPageRoute(pathname);
    if (route !== null) setPageParams(route, extractPageParams(route, searchParams).toString());
  }, [pathname, searchParams, setPageParams]);
}
