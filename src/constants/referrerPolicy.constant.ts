// * every response's Referrer-Policy (next.config.ts) and every map tile request's: the origin goes
// * cross-site, as OpenStreetMap's tile usage policy asks; full URLs stay on our own site. No
// * imports: next.config.ts reads this file directly
export const REFERRER_POLICY = "strict-origin-when-cross-origin" satisfies ReferrerPolicy;
