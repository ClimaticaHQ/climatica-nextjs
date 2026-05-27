"use client";

import { Sidebar, Topbar } from "@/components";
import { Suspense, useEffect, useState } from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) closeSidebar();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Topbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
      <div className="relative flex flex-1 overflow-hidden">
        {isSidebarOpen && (
          <div
            className="absolute inset-0 z-30 bg-black/30 lg:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
        <Suspense>
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        </Suspense>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
