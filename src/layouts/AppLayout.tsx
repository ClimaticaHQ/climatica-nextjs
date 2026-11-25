"use client";

import { MotionRoot, NavigationIntentTracker, TextSizeRoot, ThemeRoot, Topbar } from "@/components";
import { AnalyticsConsent } from "@/components/consent";
import { FiltersSidebar } from "@/components/filters";
import { InfoNavigationProvider, InfoSidePanel } from "@/components/info";
import { SidebarSkeleton, TopbarSkeleton } from "@/components/UI";
import { useFilterView } from "@/hooks/filters/useFilterView";
import { isInfoRoute } from "@/utils/info.util";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { UrlSync } from "./UrlSync";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const hasFilters = useFilterView() !== null;
  const isInfoPage = isInfoRoute(usePathname());
  const row = (
    // * clip, not hidden: an anchor jump in <main> mustn't scroll this row and shift the side panel
    <div className="relative flex min-h-0 flex-1 overflow-clip">
      {hasFilters && (
        <Suspense fallback={<SidebarSkeleton />}>
          <FiltersSidebar />
        </Suspense>
      )}
      {isInfoPage && <InfoSidePanel />}
      <main className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {children}
      </main>
    </div>
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <ThemeRoot />
      <TextSizeRoot />
      <MotionRoot />
      <NavigationIntentTracker />
      <Suspense fallback={null}>
        <UrlSync />
      </Suspense>
      <Suspense fallback={<TopbarSkeleton />}>
        <Topbar />
      </Suspense>
      {/* outside the page's own Suspense boundary, so the Info navigation streams with the shell */}
      {isInfoPage ? <InfoNavigationProvider>{row}</InfoNavigationProvider> : row}
      <AnalyticsConsent />
    </div>
  );
}
