import type { TApiError } from "@/types";
import { NextResponse } from "next/server";

export function apiErrorResponse({ status, message }: TApiError): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
