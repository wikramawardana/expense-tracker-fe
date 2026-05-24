"use client";

import {
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  PanelLeft,
  Receipt,
  Tags,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserMenu } from "@/components/user-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const dashboardItem = {
  title: "Dashboard",
  href: "/dashboard",
  icon: LayoutDashboard,
};

const menuItems = [
  { title: "Expenses", href: "/expenses", icon: Receipt },
  { title: "Categories", href: "/categories", icon: Tags },
  { title: "Payment Methods", href: "/payment-methods", icon: CreditCard },
  { title: "Bill Statements", href: "/bill-statements", icon: FileText },
];

function getPageTitle(pathname: string): string {
  const all = [dashboardItem, ...menuItems];
  const match = all.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return match?.title ?? "Dashboard";
}

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const allNavItems = [dashboardItem, ...menuItems];
  const pageTitle = getPageTitle(pathname);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function NavLinks({ inSheet = false }: { inSheet?: boolean }) {
    const showCollapsed = collapsed && !inSheet;

    return (
      <ScrollArea className="h-full pt-3 pb-2">
        {!showCollapsed && (
          <p className="px-4 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
        )}
        <nav className="flex flex-col gap-0.5 px-2">
          {allNavItems.map((item) => {
            const active = isActive(item.href);
            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={() => inSheet && setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  showCollapsed && "justify-center px-2",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!showCollapsed && <span>{item.title}</span>}
              </Link>
            );

            if (showCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              );
            }
            return linkContent;
          })}
        </nav>

        <div className="mt-2 px-2 pt-2 mx-0 border-t border-sidebar-border">
          {collapsed && !inSheet ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/"
                  prefetch={false}
                  className="flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                >
                  <Home className="h-4 w-4 shrink-0" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Back to Home</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/"
              prefetch={false}
              onClick={() => inSheet && setMobileOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            >
              <Home className="h-4 w-4 shrink-0" />
              <span>Back to Home</span>
            </Link>
          )}
        </div>
      </ScrollArea>
    );
  }

  function Brand({
    collapsed: c = false,
    onClick,
  }: {
    collapsed?: boolean;
    onClick?: () => void;
  }) {
    return c ? (
      <Link href="/dashboard" className="mx-auto" onClick={onClick}>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
          <Wallet className="h-4 w-4" />
        </div>
      </Link>
    ) : (
      <Link
        href="/dashboard"
        onClick={onClick}
        className="flex items-center gap-2.5 text-foreground"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
          <Wallet className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">
            Expense Tracker
          </span>
          <span className="text-[11px] text-muted-foreground leading-tight">
            Finance Management
          </span>
        </div>
      </Link>
    );
  }

  if (isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="flex h-screen flex-col bg-background">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMobileOpen(true)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-sm font-semibold text-foreground">
              {pageTitle}
            </h2>
            <div className="ml-auto">
              <UserMenu />
            </div>
          </header>

          <main className="flex-1 overflow-auto">{children}</main>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="w-72 border-r border-sidebar-border bg-sidebar p-0 [&>button]:hidden"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Main navigation menu</SheetDescription>
            </SheetHeader>
            <div className="flex h-14 items-center border-b border-sidebar-border px-3">
              <Brand onClick={() => setMobileOpen(false)} />
            </div>
            <NavLinks inSheet />
          </SheetContent>
        </Sheet>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "grid h-screen grid-rows-[3.5rem_1fr] transition-all duration-300 bg-background",
          collapsed ? "grid-cols-[64px_1fr]" : "grid-cols-[256px_1fr]",
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center border-r border-b border-sidebar-border bg-sidebar px-3">
          <Brand collapsed={collapsed} />
        </div>

        {/* Main header */}
        <header className="flex items-center gap-2 border-b border-border bg-card px-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setCollapsed(!collapsed)}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
          <h2 className="text-sm font-semibold text-foreground">{pageTitle}</h2>
          <div className="ml-auto">
            <UserMenu />
          </div>
        </header>

        {/* Sidebar nav */}
        <div className="border-r border-sidebar-border bg-sidebar overflow-hidden">
          <NavLinks />
        </div>

        {/* Main content */}
        <main className="overflow-auto">{children}</main>
      </div>
    </TooltipProvider>
  );
}
