"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useDashboardCompany } from "@/components/layout/dashboard-shell";
import { PanelLeftOpen } from "lucide-react";

interface TopBarProps {
  title?: string;
  companyName?: string;
}

export function TopBar({
  title,
  companyName,
}: TopBarProps) {
  const { collapsed, toggleCollapsed } = useSidebar();
  const dashboardCompany = useDashboardCompany();
  const displayCompanyName = companyName ?? dashboardCompany.name;

  const initials = displayCompanyName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "H";

  return (
    <header className="sticky top-14 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:px-6 lg:top-0">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {collapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden shrink-0 items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted lg:flex"
            title="Show navigation"
            aria-label="Show navigation"
          >
            <span className="flex size-7 items-center justify-center rounded bg-primary text-xs font-bold text-white">
              H
            </span>
            <PanelLeftOpen className="size-4 text-muted-foreground" />
          </button>
        )}
        {title && (
          <h1 className="truncate text-lg font-semibold text-foreground">
            {title}
          </h1>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden text-sm font-medium text-foreground sm:inline">
          {displayCompanyName}
        </span>
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary text-xs text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
