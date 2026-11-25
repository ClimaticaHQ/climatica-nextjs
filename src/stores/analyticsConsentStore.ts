"use client";

import { createConsentStore } from "@/utils/analyticsConsent.util";

/** The analytics choice in localStorage, shared by the banner, Settings and GA's loader. */
export const analyticsConsentStore = createConsentStore();
