import type { TBuildDocumentTitleArgs } from "@/types";
import { buildDocumentTitle } from "@/utils";
import { useEffect } from "react";

/** The tab's title: the page's place(s) and details, or the page's name until they're known. */
export function useDocumentTitle(args: TBuildDocumentTitleArgs) {
  const title = buildDocumentTitle(args);
  useEffect(() => {
    document.title = title;
  }, [title]);
}
