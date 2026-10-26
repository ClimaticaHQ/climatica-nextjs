import { env } from "@/libs/Env";
import type { TUpstreamResult } from "@/types";

/**
 * Calls the WorldClim API with the server-side key. An error status, a network failure
 * or a body that isn't JSON all come back as a failure, so a route never passes them on as data.
 */
export async function fetchWorldClimJson(url: string): Promise<TUpstreamResult> {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${env.WORLDCLIM_API_KEY}`,
        Accept: "application/json",
      },
    });
    if (!response.ok) return { ok: false, reason: `upstream status ${response.status}` };

    const data: unknown = await response.json();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}
