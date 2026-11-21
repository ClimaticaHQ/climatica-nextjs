"use client";

import { MotionRoot, NavigationIntentTracker, TextSizeRoot, ThemeRoot, Topbar } from "@/components";
import { FiltersSidebar } from "@/components/filters";
import { InfoNavigationProvider, InfoSidePanel } from "@/components/info";
import { SidebarSkeleton, TopbarSkeleton } from "@/components/UI";
import { useFilterView } from "@/hooks/filters/useFilterView";
import { isInfoRoute } from "@/utils/info.util";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { UrlSync } from "./UrlSync";

export function AppLayout({ children }: { children: React.ReactNode }) {
  // * the filters column only where a page has filters (not on settings, nor a missing page)
  const hasFilters = useFilterView() !== null;
  // * the Info pages' navigation is a left panel too, rendered on the server like the page
  const isInfoPage = isInfoRoute(usePathname());
  const row = (
    // * clip, not hidden: an anchor jump in <main> mustn't scroll this row (absolute
    // * descendants, sr-only text among them, overflow it) and shift the side panel
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
      {/* * the Info pages' navigation: around the side panel and <main>, in the page's first
          HTML (outside the page's own boundary, so it streams with the shell) */}
      {isInfoPage ? <InfoNavigationProvider>{row}</InfoNavigationProvider> : row}
    </div>
  );
}
