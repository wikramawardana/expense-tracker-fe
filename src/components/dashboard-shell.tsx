"use client";

import {
  CalendarClock,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileText,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Repeat2,
  Tags,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import * as React from "react";
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
import type {
  ExpenseNavigationMethod,
  ExpenseType,
} from "@/types/expense.types";

const workspaces = [
  {
    title: "Transactions",
    allLabel: "All expenses",
    href: "/expenses",
    icon: Receipt,
    expenseType: "transaction" as ExpenseType,
  },
  {
    title: "Installments",
    allLabel: "All installments",
    href: "/installments",
    icon: CalendarClock,
    expenseType: "installment" as ExpenseType,
  },
  {
    title: "Subscriptions",
    allLabel: "All subscriptions",
    href: "/subscriptions",
    icon: Repeat2,
    expenseType: "subscription" as ExpenseType,
  },
];

const utilityItems = [
  { title: "Categories", href: "/categories", icon: Tags },
  { title: "Payment Methods", href: "/payment-methods", icon: CreditCard },
  { title: "Statements", href: "/bill-statements", icon: FileText },
  { title: "Paid By", href: "/paid-by", icon: Users },
];

function pageTitle(pathname: string) {
  if (pathname === "/dashboard") return "Overview";
  const workspace = workspaces.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (workspace) return workspace.title;
  return (
    utilityItems.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.title ?? "Overview"
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      workspaces.map((workspace) => [
        workspace.href,
        pathname === workspace.href,
      ]),
    ),
  );
  const [methods, setMethods] = React.useState<
    Record<ExpenseType, ExpenseNavigationMethod[]>
  >({ transaction: [], installment: [], subscription: [] });

  React.useEffect(() => {
    Promise.all(
      workspaces.map(async (workspace) => ({
        type: workspace.expenseType,
        response: await getExpenseNavigation({
          expense_type: workspace.expenseType,
        }),
      })),
    )
      .then((responses) => {
        setMethods((current) => {
          const next = { ...current };
          for (const item of responses)
            next[item.type] = item.response.data.methods;
          return next;
        });
      })
      .catch((error) => console.error("Failed to load navigation", error));
  }, []);

  React.useEffect(() => {
    const active = workspaces.find((workspace) => pathname === workspace.href);
    if (active) {
      setExpanded((current) => ({ ...current, [active.href]: true }));
    }
  }, [pathname]);

  const selectedMethod =
    searchParams.get("payment_method_id") || searchParams.get("payment_method");

  const closeMobile = () => setMobileOpen(false);
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  function Brand({ compact = false }: { compact?: boolean }) {
    return (
      <Link
        href="/dashboard"
        onClick={closeMobile}
        className={cn("flex items-center gap-3", compact && "justify-center")}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <WalletCards className="size-5" />
        </span>
        {!compact && (
          <span>
            <span className="block text-base font-semibold tracking-tight">
              SpendCTRL
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Personal finance
            </span>
          </span>
        )}
      </Link>
    );
  }

  function NavLink({
    href,
    title,
    icon: Icon,
    compact,
  }: {
    href: string;
    title: string;
    icon: typeof Receipt;
    compact: boolean;
  }) {
    const link = (
      <Link
        href={href}
        prefetch={false}
        onClick={closeMobile}
        className={cn(
          "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          isActive(href) && "bg-primary/10 text-primary",
          compact && "justify-center px-2",
        )}
      >
        <Icon className="size-4.5 shrink-0" />
        {!compact && <span>{title}</span>}
      </Link>
    );

    if (!compact) return link;
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{title}</TooltipContent>
      </Tooltip>
    );
  }

  function Navigation({ sheet = false }: { sheet?: boolean }) {
    const compact = collapsed && !sheet;

    return (
      <ScrollArea className="h-full">
        <div className="space-y-6 px-3 py-4">
          <nav className="space-y-1">
            <NavLink
              href="/dashboard"
              title="Overview"
              icon={LayoutDashboard}
              compact={compact}
            />
          </nav>

          <div>
            {!compact && (
              <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Spending
              </p>
            )}
            <nav className="space-y-1">
              {workspaces.map((workspace) => {
                const active = isActive(workspace.href);
                const isExpanded = expanded[workspace.href];
                const workspaceMethods = methods[workspace.expenseType];

                if (compact) {
                  return (
                    <NavLink
                      key={workspace.href}
                      href={workspace.href}
                      title={workspace.title}
                      icon={workspace.icon}
                      compact
                    />
                  );
                }

                return (
                  <div key={workspace.href}>
                    <div
                      className={cn(
                        "flex items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        active && "bg-primary/10 text-primary",
                      )}
                    >
                      <Link
                        href={workspace.href}
                        prefetch={false}
                        onClick={() => {
                          setExpanded((current) => ({
                            ...current,
                            [workspace.href]: true,
                          }));
                          if (sheet) closeMobile();
                        }}
                        className="flex min-h-10 min-w-0 flex-1 items-center gap-3 px-3 py-2 text-sm font-medium"
                      >
                        <workspace.icon className="size-4.5 shrink-0" />
                        <span className="truncate">{workspace.title}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((current) => ({
                            ...current,
                            [workspace.href]: !current[workspace.href],
                          }))
                        }
                        className="grid size-10 place-items-center rounded-lg"
                        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${workspace.title}`}
                      >
                        {isExpanded ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="ml-5 mt-1 space-y-1 border-l border-border pl-3">
                        <Link
                          href={workspace.href}
                          prefetch={false}
                          onClick={closeMobile}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                            pathname === workspace.href &&
                              !selectedMethod &&
                              "bg-muted font-medium text-foreground",
                          )}
                        >
                          {workspace.allLabel}
                        </Link>
                        {workspaceMethods.map((method) => {
                          const methodKey =
                            method.payment_method_id || method.name;
                          const params = new URLSearchParams();
                          if (method.payment_method_id) {
                            params.set(
                              "payment_method_id",
                              method.payment_method_id,
                            );
                          }
                          params.set("payment_method", method.name);

                          return (
                            <Link
                              key={methodKey}
                              href={`${workspace.href}?${params.toString()}`}
                              prefetch={false}
                              onClick={closeMobile}
                              className={cn(
                                "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                                pathname === workspace.href &&
                                  selectedMethod === methodKey &&
                                  "bg-muted font-medium text-foreground",
                              )}
                            >
                              <span className="truncate">{method.name}</span>
                              <span className="text-[10px] tabular-nums">
                                {method.totals.total_count}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div>
            {!compact && (
              <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Manage
              </p>
            )}
            <nav className="space-y-1">
              {utilityItems.map((item) => (
                <NavLink key={item.href} {...item} compact={compact} />
              ))}
            </nav>
          </div>
        </div>
      </ScrollArea>
    );
  }

  const Header = ({ mobile = false }: { mobile?: boolean }) => (
    <header className="flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() =>
          mobile ? setMobileOpen(true) : setCollapsed((current) => !current)
        }
        aria-label={mobile ? "Open navigation" : "Toggle navigation"}
      >
        {mobile ? <Menu /> : collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      </Button>
      <h1 className="text-lg font-semibold tracking-tight">
        {pageTitle(pathname)}
      </h1>
      <div className="ml-auto">
        <UserMenu />
      </div>
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
            className="w-[min(88vw,300px)] border-r border-border bg-card p-0 [&>button]:hidden"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Main application navigation</SheetDescription>
            </SheetHeader>
            <div className="flex h-16 items-center border-b border-border px-5">
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
          "grid h-dvh grid-rows-[4rem_1fr] bg-background transition-[grid-template-columns] duration-200",
          collapsed ? "grid-cols-[72px_1fr]" : "grid-cols-[260px_1fr]",
        )}
      >
        <div className="flex items-center border-b border-r border-border bg-card px-4">
          <Brand compact={collapsed} />
        </div>
        <Header />
        <aside className="overflow-hidden border-r border-border bg-card">
          <Navigation />
        </aside>
        <main className="custom-scrollbar overflow-auto">{children}</main>
      </div>
    </TooltipProvider>
  );
}
