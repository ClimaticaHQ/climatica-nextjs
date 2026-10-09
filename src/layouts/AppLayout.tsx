"use client";

import { FilterUrlSync, MotionRoot, NavigationIntentTracker, Sidebar, Topbar } from "@/components";
import { SidebarSkeleton, TopbarSkeleton } from "@/components/UI";
import { Suspense } from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <MotionRoot />
      <NavigationIntentTracker />
      <Suspense fallback={null}>
        <FilterUrlSync />
      </Suspense>
      <Suspense fallback={<TopbarSkeleton />}>
        <Topbar />
      </Suspense>
      <div className="relative flex flex-1 overflow-hidden">
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />
        </Suspense>
        <main className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
          {children}
        </main>
      </div>
    </div>
  );
}
