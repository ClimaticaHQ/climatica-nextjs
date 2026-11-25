import type { TBuildDocumentTitleArgs } from "@/types";
import { buildDocumentTitle } from "@/utils";
import { useEffect } from "react";

export function useDocumentTitle(args: TBuildDocumentTitleArgs) {
  const title = buildDocumentTitle(args);
  useEffect(() => {
    document.title = title;
  }, [title]);
}
