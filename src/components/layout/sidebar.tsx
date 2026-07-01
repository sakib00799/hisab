"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Landmark,
  Building2,
  Settings,
  Sparkles,
  Calculator,
  Menu,
  X,
  PanelLeftClose,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/layout/sidebar-context";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/vat", label: "VAT Report", icon: Calculator },
  { href: "/bank", label: "Bank Import", icon: Landmark },
  { href: "/customers", label: "Customers", icon: Building2 },
];

const bottomItems = [{ href: "/settings", label: "Settings", icon: Settings }];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}

      <div className="my-4 border-t border-border" />

      {bottomItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

function HisabLogo({ onClick, showLabel = true }: { onClick?: () => void; showLabel?: boolean }) {
  const inner = (
    <>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">
        H
      </div>
      {showLabel && (
        <span className="text-lg font-semibold text-foreground">Hisab</span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 rounded-md text-left transition-opacity hover:opacity-80"
        title="Toggle navigation menu"
        aria-label="Toggle navigation menu"
      >
        {inner}
      </button>
    );
  }

  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      {inner}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, mobileOpen, toggleCollapsed, setMobileOpen } = useSidebar();

  const sidebarHiddenOnDesktop = collapsed;
  const sidebarVisible =
    mobileOpen || !sidebarHiddenOnDesktop;

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center border-b border-border bg-surface px-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
        <div className="ml-2">
          <HisabLogo onClick={() => setMobileOpen(true)} />
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-sidebar flex-col border-r border-border bg-surface transition-transform duration-200 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          !collapsed && "lg:translate-x-0",
          collapsed && "lg:-translate-x-full"
        )}
        aria-hidden={!sidebarVisible}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4 lg:px-6">
          <HisabLogo
            onClick={() => {
              toggleCollapsed();
              setMobileOpen(false);
            }}
          />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={toggleCollapsed}
              title="Hide navigation"
              aria-label="Hide navigation"
            >
              <PanelLeftClose className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <NavLinks
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />
        </nav>

        <div className="border-t border-border p-4">
          <Link
            href="/upgrade"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
          >
            <Sparkles className="size-4" />
            Upgrade
          </Link>
        </div>
      </aside>
    </>
  );
}
