"use client";

import { createContext, useContext } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";

interface DashboardCompany {
  name: string;
}

const DashboardCompanyContext = createContext<DashboardCompany>({
  name: "Hisab",
});

export function useDashboardCompany() {
  return useContext(DashboardCompanyContext);
}

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          "min-h-screen min-w-0 pt-14 transition-[margin-left] duration-200 ease-in-out lg:pt-0",
          collapsed ? "lg:ml-0" : "lg:ml-sidebar"
        )}
      >
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  company,
}: {
  children: React.ReactNode;
  company: DashboardCompany;
}) {
  return (
    <DashboardCompanyContext.Provider value={company}>
      <SidebarProvider>
        <DashboardShellInner>{children}</DashboardShellInner>
      </SidebarProvider>
    </DashboardCompanyContext.Provider>
  );
}
