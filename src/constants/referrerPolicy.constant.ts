// * the origin goes cross-site, as OSM's tile usage policy asks; no imports: next.config.ts reads this file directly
export const REFERRER_POLICY = "strict-origin-when-cross-origin" satisfies ReferrerPolicy;
