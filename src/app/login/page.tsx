"use client";

import {
  ArrowUpRight,
  Check,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid size-12 place-items-center border-3 border-foreground bg-accent text-foreground shadow-[4px_4px_0_var(--foreground)]">
        <WalletCards className="size-6" strokeWidth={2.8} />
        <span className="absolute -right-2 -top-2 size-3 border-2 border-foreground bg-warning" />
      </div>
      <div>
        <p className="text-xl font-black uppercase leading-none tracking-[-0.06em]">
          Spend<span className="text-primary">CTRL</span>
        </p>
        <p className="mt-1 font-mono text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground">
          Money, under control
        </p>
      </div>
    </div>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  React.useEffect(() => {
    if (!isPending && session) {
      fetch("/api/auth/get-session")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) window.location.href = callbackUrl;
        })
        .catch(() => {});
    }
  }, [session, isPending, callbackUrl]);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.oauth2({
        providerId: "auth",
        callbackURL: callbackUrl,
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background p-3 sm:p-5 lg:p-7">
      <div className="pointer-events-none absolute -left-16 top-12 size-52 rotate-12 border-3 border-foreground bg-accent opacity-70" />
      <div className="pointer-events-none absolute -bottom-16 right-[35%] size-40 -rotate-12 border-3 border-foreground bg-secondary opacity-80" />

      <div className="relative mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-[1500px] overflow-hidden border-3 border-foreground bg-card shadow-[9px_9px_0_var(--foreground)] sm:min-h-[calc(100dvh-2.5rem)] lg:grid-cols-[1.08fr_.92fr]">
        <section className="relative hidden overflow-hidden border-r-3 border-foreground bg-primary p-8 text-primary-foreground lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle,#fff_2px,transparent_2px)] [background-size:24px_24px]" />
          <div className="relative">
            <div className="inline-flex -rotate-2 items-center gap-2 border-2 border-foreground bg-warning px-3 py-1.5 font-mono text-xs font-black uppercase tracking-widest text-foreground shadow-[4px_4px_0_var(--foreground)]">
              <Sparkles className="size-4" />
              Personal finance OS
            </div>
          </div>

          <div className="relative max-w-3xl py-10">
            <p className="mb-5 font-mono text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
              Track it. Know it. Own it.
            </p>
            <h1 className="text-[clamp(4rem,7.2vw,8.7rem)] font-black uppercase leading-[0.78] tracking-[-0.085em]">
              Make
              <br />
              every
              <br />
              <span className="inline-block -rotate-2 border-3 border-foreground bg-accent px-3 pb-2 text-foreground shadow-[7px_7px_0_var(--foreground)]">
                rupiah
              </span>
              <br />
              count.
            </h1>
          </div>

          <div className="relative grid max-w-2xl grid-cols-3 gap-3">
            {[
              ["01", "Capture fast"],
              ["02", "See clearly"],
              ["03", "Spend smarter"],
            ].map(([number, text]) => (
              <div
                key={number}
                className="border-2 border-foreground bg-card p-3 text-foreground shadow-[4px_4px_0_var(--foreground)]"
              >
                <span className="font-mono text-xs font-black text-primary">
                  {number}
                </span>
                <p className="mt-3 text-sm font-black uppercase leading-tight">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative flex flex-col bg-card p-5 sm:p-8 xl:p-12">
          <div className="flex items-center justify-between">
            <BrandMark />
            <div className="hidden items-center gap-2 border-2 border-foreground bg-success px-3 py-1 font-mono text-[10px] font-black uppercase shadow-[3px_3px_0_var(--foreground)] sm:flex">
              <span className="size-2 bg-foreground" />
              Secure access
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-12 sm:py-16">
            <div className="mb-8">
              <span className="neo-label mb-5">
                <LockKeyhole className="size-3.5" />
                Members only
              </span>
              <h2 className="text-5xl font-black uppercase leading-[0.9] tracking-[-0.07em] sm:text-6xl">
                Welcome
                <br />
                back<span className="text-primary">!</span>
              </h2>
              <p className="mt-5 max-w-md font-mono text-sm font-bold leading-relaxed text-muted-foreground">
                Your expenses, bills, and payment data are ready. Sign in and
                get the full picture.
              </p>
            </div>

            <div className="border-3 border-foreground bg-secondary p-4 shadow-[7px_7px_0_var(--foreground)] sm:p-6">
              <Button
                onClick={handleSignIn}
                disabled={isLoading || isPending}
                variant="outline"
                className="h-14 w-full justify-between bg-card px-5 text-base normal-case"
              >
                <span className="flex items-center gap-3">
                  {isLoading || isPending ? (
                    <span className="size-5 animate-spin border-3 border-foreground border-r-transparent" />
                  ) : (
                    <GoogleIcon className="size-5" />
                  )}
                  {isLoading || isPending
                    ? "Connecting..."
                    : "Continue with Google"}
                </span>
                <ArrowUpRight className="size-5" />
              </Button>
              <div className="mt-5 flex items-center gap-2 font-mono text-[10px] font-black uppercase text-foreground/70">
                <ShieldCheck className="size-4" />
                Encrypted authentication · Authorized users only
              </div>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 border-2 border-foreground bg-background p-3">
                <span className="grid size-7 shrink-0 place-items-center bg-primary text-primary-foreground">
                  <ReceiptText className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase">All in one</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expenses, bills & methods
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-2 border-foreground bg-background p-3">
                <span className="grid size-7 shrink-0 place-items-center bg-accent text-foreground">
                  <Check className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase">Always current</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Live financial overview
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t-2 border-foreground pt-4 font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Expense tracker / 2026</span>
            <span>Built for focus</span>
          </div>
        </section>
      </div>
    </main>
  );
}

function LoginLoading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-5">
      <div className="neo-panel flex items-center gap-4 p-6">
        <span className="size-8 animate-spin border-4 border-primary border-r-transparent" />
        <p className="font-mono text-sm font-black uppercase tracking-widest">
          Loading workspace
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
