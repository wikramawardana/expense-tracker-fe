"use client";

import {
  CreditCard,
  FileText,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Tags,
  Users,
  WalletCards,
  Zap,
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

const navItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard, code: "01" },
  { title: "Expenses", href: "/expenses", icon: Receipt, code: "02" },
  { title: "Categories", href: "/categories", icon: Tags, code: "03" },
  {
    title: "Pay Methods",
    href: "/payment-methods",
    icon: CreditCard,
    code: "04",
  },
  { title: "Statements", href: "/bill-statements", icon: FileText, code: "05" },
  { title: "Paid By", href: "/paid-by", icon: Users, code: "06" },
];

function getPageTitle(pathname: string) {
  return (
    navItems.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.title ?? "Overview"
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageTitle = getPageTitle(pathname);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function Brand({ compact = false }: { compact?: boolean }) {
    return (
      <Link
        href="/dashboard"
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 text-sidebar-foreground",
          compact && "justify-center",
        )}
      >
        <span className="relative grid size-10 shrink-0 place-items-center border-2 border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground shadow-[3px_3px_0_var(--sidebar-border)]">
          <WalletCards className="size-5" strokeWidth={3} />
          <span className="absolute -right-1.5 -top-1.5 size-2.5 border-2 border-sidebar-border bg-warning" />
        </span>
        {!compact && (
          <span>
            <span className="block text-lg font-black uppercase leading-none tracking-[-0.06em]">
              SpendCTRL
            </span>
            <span className="mt-1 block font-mono text-[8px] font-black uppercase tracking-[0.2em] text-blue-100">
              Finance workspace
            </span>
          </span>
        )}
      </Link>
    );
  }

  function Navigation({ sheet = false }: { sheet?: boolean }) {
    const compact = collapsed && !sheet;
    return (
      <ScrollArea className="h-full">
        <div
          className={cn("flex h-full flex-col px-2 py-4", !compact && "px-3")}
        >
          {!compact && (
            <div className="mb-3 flex items-center gap-2 px-2 font-mono text-[9px] font-black uppercase tracking-[0.22em] text-blue-100">
              <span className="h-0.5 flex-1 bg-blue-200/50" />
              Command center
            </div>
          )}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  onClick={() => sheet && setMobileOpen(false)}
                  className={cn(
                    "group relative flex min-h-12 items-center gap-3 border-2 px-3 py-2 text-sm font-black uppercase transition-all",
                    active
                      ? "translate-x-[-2px] translate-y-[-2px] border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground shadow-[4px_4px_0_var(--sidebar-border)]"
                      : "border-transparent text-blue-50 hover:border-sidebar-border hover:bg-sidebar-primary hover:text-sidebar-primary-foreground hover:shadow-[3px_3px_0_var(--sidebar-border)]",
                    compact && "justify-center px-2",
                  )}
                >
                  <item.icon
                    className="size-5 shrink-0"
                    strokeWidth={active ? 3 : 2.2}
                  />
                  {!compact && (
                    <>
                      <span>{item.title}</span>
                      <span
                        className={cn(
                          "ml-auto font-mono text-[9px]",
                          active ? "text-primary" : "text-blue-200",
                        )}
                      >
                        {item.code}
                      </span>
                    </>
                  )}
                  {active && (
                    <span className="absolute -right-1.5 -top-1.5 size-3 border-2 border-sidebar-border bg-accent" />
                  )}
                </Link>
              );

              return compact ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              ) : (
                link
              );
            })}
          </nav>

          {!compact && (
            <div className="mt-6 border-2 border-sidebar-border bg-blue-950/25 p-3 text-sidebar-foreground shadow-[3px_3px_0_var(--sidebar-border)]">
              <div className="mb-2 flex items-center gap-2">
                <Zap className="size-4 fill-accent text-accent" />
                <p className="text-xs font-black uppercase">Quick tip</p>
              </div>
              <p className="font-mono text-[10px] leading-relaxed text-blue-100">
                Keep every transaction categorized for a cleaner monthly view.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    );
  }

  const Header = ({ mobile = false }: { mobile?: boolean }) => (
    <header className="relative flex h-16 items-center gap-3 border-b-3 border-foreground bg-card px-3 sm:px-5">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() =>
          mobile ? setMobileOpen(true) : setCollapsed(!collapsed)
        }
        aria-label={mobile ? "Open navigation" : "Toggle navigation"}
        className="bg-accent"
      >
        {mobile ? <Menu /> : collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      </Button>
      <div>
        <p className="font-mono text-[8px] font-black uppercase tracking-[0.22em] text-primary">
          Workspace / Live
        </p>
        <h1 className="text-lg font-black uppercase leading-none tracking-[-0.04em] sm:text-xl">
          {pageTitle}
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 border-2 border-foreground bg-success px-2.5 py-1 font-mono text-[9px] font-black uppercase shadow-[2px_2px_0_var(--foreground)] sm:flex">
          <span className="size-2 animate-pulse bg-foreground" />
          Synced
        </div>
        <UserMenu />
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-28 translate-y-full bg-primary" />
    </header>
  );

  if (isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="flex h-dvh flex-col bg-background">
          <Header mobile />
          <main className="custom-scrollbar flex-1 overflow-auto">
            {children}
          </main>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="w-[min(88vw,320px)] border-r-3 border-sidebar-border bg-sidebar p-0 [&>button]:hidden"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Main application navigation</SheetDescription>
            </SheetHeader>
            <div className="flex h-20 items-center border-b-3 border-sidebar-border px-5">
              <Brand />
            </div>
            <Navigation sheet />
          </SheetContent>
        </Sheet>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "grid h-dvh grid-rows-[5rem_1fr] bg-background transition-[grid-template-columns] duration-200",
          collapsed ? "grid-cols-[76px_1fr]" : "grid-cols-[270px_1fr]",
        )}
      >
        <div className="flex items-center border-b-3 border-r-3 border-sidebar-border bg-sidebar px-4">
          <Brand compact={collapsed} />
        </div>
        <Header />
        <aside className="overflow-hidden border-r-3 border-sidebar-border bg-sidebar">
          <Navigation />
        </aside>
        <main className="custom-scrollbar overflow-auto">{children}</main>
      </div>
    </TooltipProvider>
  );
}
