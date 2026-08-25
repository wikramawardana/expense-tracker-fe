import { ArrowLeft, ShieldX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-background p-5">
      <div className="absolute -left-16 top-12 size-52 rotate-12 border-3 border-foreground bg-secondary" />
      <div className="absolute -bottom-12 right-10 size-40 -rotate-12 border-3 border-foreground bg-accent" />
      <section className="neo-panel relative w-full max-w-2xl overflow-hidden">
        <div className="border-b-3 border-foreground bg-destructive p-5 sm:p-7">
          <span className="neo-label bg-card">Error / 403</span>
          <ShieldX className="ml-auto mt-8 size-20" strokeWidth={2.5} />
        </div>
        <div className="p-6 sm:p-9">
          <h1 className="text-5xl font-black uppercase leading-[0.85] tracking-[-0.07em] sm:text-7xl">
            Access
            <br />
            denied<span className="text-primary">.</span>
          </h1>
          <p className="mt-6 max-w-lg font-mono text-sm font-bold leading-relaxed text-muted-foreground">
            Your account does not have permission to open this page. Contact an
            administrator if you think that is a mistake.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard">
                <ArrowLeft />
                Back to dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/login">Sign in again</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
