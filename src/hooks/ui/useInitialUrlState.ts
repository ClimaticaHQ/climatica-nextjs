"use client";

import type { TUrlSchema } from "@/types";
import { parseUrlState } from "@/utils";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function useInitialUrlState<TState extends Record<string, unknown>>(
  schema: TUrlSchema<TState>,
) {
  const searchParams = useSearchParams();
  const [initial] = useState(() => parseUrlState(schema, searchParams));
  return initial;
}
