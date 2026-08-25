"use client";

import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
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
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import { getExpenseNavigation } from "@/services/expenses.service";
import type { ExpenseNavigationMethod } from "@/types/expense.types";

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
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expensesExpanded, setExpensesExpanded] = useState(
    pathname === "/expenses",
  );
  const [monthsExpanded, setMonthsExpanded] = useState(
    !!searchParams.get("bill_statement_id"),
  );
  const [expandedMonth, setExpandedMonth] = useState<string | null>(
    searchParams.get("bill_statement_id"),
  );
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [expenseNavigation, setExpenseNavigation] = useState<
    ExpenseNavigationMethod[]
  >([]);
  const pageTitle = getPageTitle(pathname);

  useEffect(() => {
    getExpenseNavigation()
      .then((response) => setExpenseNavigation(response.data.methods))
      .catch((error) =>
        console.error("Failed to load expense navigation", error),
      );
  }, []);

  useEffect(() => {
    if (pathname === "/expenses") setExpensesExpanded(true);
    const selectedStatement = searchParams.get("bill_statement_id");
    if (selectedStatement) {
      setMonthsExpanded(true);
      setExpandedMonth(selectedStatement);
    }
  }, [pathname, searchParams]);

  const expenseMonths = useMemo(() => {
    const months = new Map<
      string,
      ExpenseNavigationMethod["months"][number] & { total_count: number }
    >();
    for (const method of expenseNavigation) {
      for (const month of method.months) {
        const existing = months.get(month.bill_statement_id);
        months.set(month.bill_statement_id, {
          ...month,
          total_count: (existing?.total_count ?? 0) + month.totals.total_count,
        });
      }
    }
    return Array.from(months.values()).sort((a, b) =>
      (b.statement_date ?? "").localeCompare(a.statement_date ?? ""),
    );
  }, [expenseNavigation]);

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
            <span className="mt-1 block font-mono text-[10px] font-black uppercase tracking-[0.16em] text-blue-100">
              Finance workspace
            </span>
          </span>
        )}
      </Link>
    );
  }

  function Navigation({ sheet = false }: { sheet?: boolean }) {
    const compact = collapsed && !sheet;

    function expenseHref(method: ExpenseNavigationMethod, statementId: string) {
      const params = new URLSearchParams();
      params.set("bill_statement_id", statementId);
      if (method.payment_method_id) {
        params.set("payment_method_id", method.payment_method_id);
      }
      params.set("payment_method", method.name);
      return `/expenses?${params.toString()}`;
    }

    return (
      <ScrollArea className="h-full">
        <div
          className={cn("flex h-full flex-col px-2 py-4", !compact && "px-3")}
        >
          {!compact && (
            <div className="mb-4 flex items-center gap-2 px-2 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">
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
                  onClick={() => {
                    if (item.href === "/expenses") setExpensesExpanded(true);
                    if (sheet) setMobileOpen(false);
                  }}
                  className={cn(
                    "group relative flex min-h-13 items-center gap-3 border-2 px-3 py-2.5 text-[15px] font-black uppercase transition-all",
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
                      {item.href === "/expenses" ? (
                        expensesExpanded ? (
                          <ChevronDown className="ml-auto size-4" />
                        ) : (
                          <ChevronRight className="ml-auto size-4" />
                        )
                      ) : (
                        <span
                          className={cn(
                            "ml-auto font-mono text-[10px]",
                            active ? "text-primary" : "text-blue-200",
                          )}
                        >
                          {item.code}
                        </span>
                      )}
                    </>
                  )}
                  {active && (
                    <span className="absolute -right-1.5 -top-1.5 size-3 border-2 border-sidebar-border bg-accent" />
                  )}
                </Link>
              );

              if (compact) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                );
              }

              if (item.href !== "/expenses" || !expensesExpanded) {
                return link;
              }

              const selectedMethod =
                searchParams.get("payment_method_id") ||
                searchParams.get("payment_method");
              const selectedStatement = searchParams.get("bill_statement_id");

              return (
                <div key={item.href} className="space-y-2">
                  {link}
                  <div className="ml-4 space-y-1 border-l-2 border-cyan-200/70 pl-3">
                    <Link
                      href="/expenses"
                      prefetch={false}
                      onClick={() => sheet && setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2 border-2 border-transparent px-2 py-2.5 text-sm font-black uppercase text-white hover:bg-blue-950/30",
                        pathname === "/expenses" &&
                          !selectedMethod &&
                          !selectedStatement &&
                          "border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground",
                      )}
                    >
                      <Receipt className="size-4" />
                      All expenses
                    </Link>

                    <button
                      type="button"
                      onClick={() => setMonthsExpanded((current) => !current)}
                      className={cn(
                        "flex w-full items-center gap-2 border-2 border-transparent px-2 py-2.5 text-left text-sm font-black uppercase text-white hover:bg-blue-950/30",
                        selectedStatement && "text-accent",
                      )}
                    >
                      {monthsExpanded ? (
                        <ChevronDown className="size-4 shrink-0" />
                      ) : (
                        <ChevronRight className="size-4 shrink-0" />
                      )}
                      <CalendarDays className="size-4 shrink-0" />
                      <span className="flex-1">Months</span>
                      <span className="font-mono text-[10px] text-cyan-100">
                        {expenseMonths.length}
                      </span>
                    </button>

                    {monthsExpanded && (
                      <div className="ml-3 space-y-1 border-l-2 border-cyan-200/50 pl-2">
                        {expenseMonths
                          .slice(0, showAllMonths ? undefined : 8)
                          .map((month) => {
                            const monthOpen =
                              expandedMonth === month.bill_statement_id;
                            const monthMethods = expenseNavigation.map(
                              (method) => ({
                                method,
                                count:
                                  method.months.find(
                                    (entry) =>
                                      entry.bill_statement_id ===
                                      month.bill_statement_id,
                                  )?.totals.total_count ?? 0,
                              }),
                            );

                            return (
                              <div key={month.bill_statement_id}>
                                <div
                                  className={cn(
                                    "flex items-stretch border-2 border-transparent text-sm font-bold text-blue-50 hover:bg-blue-950/30",
                                    selectedStatement ===
                                      month.bill_statement_id &&
                                      "border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground",
                                  )}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedMonth(
                                        monthOpen
                                          ? null
                                          : month.bill_statement_id,
                                      )
                                    }
                                    className="grid w-8 shrink-0 place-items-center"
                                    aria-label={`${monthOpen ? "Collapse" : "Expand"} ${month.name}`}
                                  >
                                    {monthOpen ? (
                                      <ChevronDown className="size-3.5" />
                                    ) : (
                                      <ChevronRight className="size-3.5" />
                                    )}
                                  </button>
                                  <Link
                                    href={`/expenses?bill_statement_id=${encodeURIComponent(month.bill_statement_id)}`}
                                    prefetch={false}
                                    onClick={() => {
                                      setExpandedMonth(month.bill_statement_id);
                                      if (sheet) setMobileOpen(false);
                                    }}
                                    className="flex min-w-0 flex-1 items-center gap-2 px-1 py-2"
                                  >
                                    <span className="min-w-0 flex-1 truncate">
                                      {month.name}
                                    </span>
                                    <span className="font-mono text-[10px] opacity-80">
                                      {month.total_count}
                                    </span>
                                  </Link>
                                </div>

                                {monthOpen && (
                                  <div className="ml-4 space-y-1 border-l-2 border-cyan-200/50 py-1 pl-2">
                                    <Link
                                      href={`/expenses?bill_statement_id=${encodeURIComponent(month.bill_statement_id)}`}
                                      prefetch={false}
                                      onClick={() =>
                                        sheet && setMobileOpen(false)
                                      }
                                      className={cn(
                                        "flex items-center gap-2 border-2 border-transparent px-2 py-2 text-xs font-black uppercase text-blue-50 hover:bg-blue-950/30",
                                        selectedStatement ===
                                          month.bill_statement_id &&
                                          !selectedMethod &&
                                          "border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground",
                                      )}
                                    >
                                      <CreditCard className="size-3.5" />
                                      All payment methods
                                    </Link>

                                    {monthMethods.map(({ method, count }) => {
                                      const methodKey =
                                        method.payment_method_id || method.name;
                                      return (
                                        <Link
                                          key={methodKey}
                                          href={expenseHref(
                                            method,
                                            month.bill_statement_id,
                                          )}
                                          prefetch={false}
                                          onClick={() =>
                                            sheet && setMobileOpen(false)
                                          }
                                          className={cn(
                                            "flex items-center gap-2 border-2 border-transparent px-2 py-2 text-sm font-bold text-blue-50 hover:bg-blue-950/30",
                                            selectedStatement ===
                                              month.bill_statement_id &&
                                              selectedMethod === methodKey &&
                                              "border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground",
                                          )}
                                        >
                                          <span className="min-w-0 flex-1 truncate">
                                            {method.name}
                                          </span>
                                          <span className="font-mono text-[10px] opacity-80">
                                            {count}
                                          </span>
                                        </Link>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        {expenseMonths.length > 8 && (
                          <button
                            type="button"
                            onClick={() =>
                              setShowAllMonths((current) => !current)
                            }
                            className="block w-full px-2 py-2 text-left text-xs font-black uppercase text-accent hover:bg-blue-950/30"
                          >
                            {showAllMonths
                              ? "Show recent months"
                              : `View ${expenseMonths.length - 8} older months`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>

          {!compact && (
            <div className="mt-6 border-2 border-sidebar-border bg-blue-950/25 p-3 text-sidebar-foreground shadow-[3px_3px_0_var(--sidebar-border)]">
              <div className="mb-2 flex items-center gap-2">
                <Zap className="size-4 fill-accent text-accent" />
                <p className="text-sm font-black uppercase">Quick tip</p>
              </div>
              <p className="font-mono text-xs font-bold leading-relaxed text-blue-100">
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
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-primary">
          Workspace / Live
        </p>
        <h1 className="text-xl font-black uppercase leading-none tracking-[-0.04em] sm:text-2xl">
          {pageTitle}
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 border-2 border-foreground bg-success px-2.5 py-1 font-mono text-[10px] font-black uppercase shadow-[2px_2px_0_var(--foreground)] sm:flex">
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
          collapsed ? "grid-cols-[76px_1fr]" : "grid-cols-[290px_1fr]",
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
