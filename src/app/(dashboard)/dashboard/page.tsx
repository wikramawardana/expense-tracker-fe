"use client";

import {
  ArrowUpRight,
  CreditCard,
  FileText,
  Receipt,
  Tags,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

const actions = [
  {
    href: "/expenses",
    icon: Receipt,
    number: "01",
    title: "Expenses",
    description: "Track, filter, import and manage every transaction.",
    color: "bg-primary text-primary-foreground",
  },
  {
    href: "/categories",
    icon: Tags,
    number: "02",
    title: "Categories",
    description: "Build a category system that matches your spending.",
    color: "bg-accent text-accent-foreground",
  },
  {
    href: "/payment-methods",
    icon: CreditCard,
    number: "03",
    title: "Pay methods",
    description: "Keep cards, cash and digital wallets organized.",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    href: "/bill-statements",
    icon: FileText,
    number: "04",
    title: "Statements",
    description: "Group recurring costs and monthly billing periods.",
    color: "bg-warning text-warning-foreground",
  },
  {
    href: "/paid-by",
    icon: Users,
    number: "05",
    title: "Paid by",
    description: "Know exactly who covered each shared expense.",
    color: "bg-success text-success-foreground",
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="app-page">
      <section className="relative overflow-hidden border-3 border-foreground bg-primary p-5 text-primary-foreground shadow-[7px_7px_0_var(--foreground)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle,#fff_2px,transparent_2px)] [background-size:22px_22px]" />
        <div className="absolute -right-8 -top-8 hidden size-52 rotate-12 border-3 border-foreground bg-accent lg:block" />
        <div className="relative max-w-4xl">
          <span className="neo-label mb-6">Your money command center</span>
          <h2 className="text-5xl font-black uppercase leading-[0.82] tracking-[-0.075em] sm:text-7xl lg:text-8xl">
            Hey {firstName}
            <span className="text-accent">!</span>
            <br />
            Let&apos;s get
            <br />
            <span className="inline-block -rotate-1 border-3 border-foreground bg-card px-3 pb-2 text-foreground shadow-[6px_6px_0_var(--foreground)]">
              spending
            </span>
            <br className="sm:hidden" /> sorted.
          </h2>
          <p className="mt-7 max-w-xl font-mono text-sm font-bold leading-relaxed text-blue-100">
            One sharp view for expenses, bills, payment methods, and the people
            behind every transaction.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Choose a workspace
            </p>
            <h3 className="text-3xl font-black uppercase tracking-[-0.055em] sm:text-4xl">
              What are we fixing today?
            </h3>
          </div>
          <WalletCards
            className="hidden size-10 text-primary sm:block"
            strokeWidth={2.5}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {actions.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              className={`group relative flex min-h-52 flex-col border-3 border-foreground p-5 shadow-[6px_6px_0_var(--foreground)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_var(--foreground)] ${action.color} ${
                index < 2 ? "xl:col-span-3" : "xl:col-span-2"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="grid size-12 place-items-center border-2 border-foreground bg-card text-foreground shadow-[3px_3px_0_var(--foreground)]">
                  <action.icon className="size-6" strokeWidth={2.7} />
                </span>
                <span className="font-mono text-xs font-black">
                  {action.number}
                </span>
              </div>
              <div className="mt-auto pt-8">
                <h4 className="text-2xl font-black uppercase tracking-[-0.05em] sm:text-3xl">
                  {action.title}
                </h4>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <p className="max-w-sm text-xs font-bold leading-relaxed opacity-75">
                    {action.description}
                  </p>
                  <span className="grid size-9 shrink-0 place-items-center border-2 border-foreground bg-card text-foreground transition-transform group-hover:-rotate-6">
                    <ArrowUpRight className="size-5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
