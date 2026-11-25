"use client";

import { createPageViewTracker } from "@/utils/analyticsConsent.util";

/** The last page GA got a page view for, kept across remounts of the page-view hook. */
export const gaPageViewTracker = createPageViewTracker();
