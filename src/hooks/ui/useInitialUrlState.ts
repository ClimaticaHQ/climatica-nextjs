"use client";

import type { TUrlSchema } from "@/types";
import { parseUrlState } from "@/utils";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * A page's URL state as its first render finds it — the server's render too, the routes being
 * dynamic. The page's view state (chart mode, layout…) starts from it rather than its default,
 * so the first paint already draws the view the URL asks for and nothing switches after
 * hydration; useUrlStateSync's restore on mount then finds it already in place. The cities are
 * left out: they wait for the persisted ones on the client.
 */
export function useInitialUrlState<TState extends Record<string, unknown>>(
  schema: TUrlSchema<TState>,
) {
  const searchParams = useSearchParams();
  const [initial] = useState(() => parseUrlState(schema, searchParams));
  return initial;
}
