import { ArrowRight, BarChart3, Receipt, Repeat, Wallet } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative grid min-h-dvh w-full grid-rows-[auto_1fr_auto] bg-background text-foreground">
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Wallet className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">
            Expense Tracker
          </span>
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign in
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-12 pb-20">
        <section className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-medium ring-1 ring-inset ring-border">
            Personal Finance Manager
          </div>
          <h1 className="text-4xl font-semibold tracking-tight leading-tight sm:text-5xl md:text-6xl">
            Track every <span className="text-primary">rupiah</span>
            <br />
            you spend.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Log expenses, manage bills, and see where your money actually goes.
            Calm, fast, and built around how you already think about money.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/login">
                Get Started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </section>

        <section className="mt-24 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={<Receipt className="h-5 w-5" />}
            title="Log Expenses"
            description="Capture daily spending fast. Categorize and tag every transaction in seconds."
          />
          <FeatureCard
            icon={<Repeat className="h-5 w-5" />}
            title="Recurring Bills"
            description="Set it once. Monthly, weekly, or yearly—never miss a payment again."
          />
          <FeatureCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="Clear Insights"
            description="See your cash flow at a glance with simple charts that actually make sense."
          />
        </section>

        <section className="mt-20 rounded-xl border border-border bg-card p-8 shadow-sm md:p-10">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Ready to take control of your money?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Sign in to start tracking in under a minute.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/login">
                Sign In
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Expense Tracker. Built by Wikra.</p>
          <p>Secured by Auth.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
        {icon}
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
