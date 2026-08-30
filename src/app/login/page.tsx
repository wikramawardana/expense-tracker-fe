"use client";

import {
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
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

function LoginForm() {
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  React.useEffect(() => {
    if (!isPending && session) {
      fetch("/api/auth/get-session")
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (data?.user) window.location.href = callbackUrl;
        })
        .catch(() => {});
    }
  }, [callbackUrl, isPending, session]);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.oauth2({
        providerId: "auth",
        callbackURL: callbackUrl,
      });
    } catch (error) {
      console.error("Sign in error", error);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center gap-3 py-2">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <WalletCards className="size-5" />
          </span>
          <div>
            <p className="font-semibold tracking-tight">SpendCTRL</p>
            <p className="text-xs text-muted-foreground">Personal finance</p>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1fr_420px]">
          <section className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
              <ShieldCheck className="size-3.5" />
              Private finance workspace
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-6xl">
              Your spending,
              <br />
              calmly organized.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Review transactions, installment plans, and subscriptions without
              the noise.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <span className="grid size-10 place-items-center rounded-xl bg-muted text-primary">
              <LockKeyhole className="size-5" />
            </span>
            <h2 className="mt-6 text-2xl font-semibold tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sign in to continue to your personal workspace.
            </p>

            <Button
              onClick={handleSignIn}
              disabled={isLoading || isPending}
              variant="outline"
              className="mt-8 h-12 w-full justify-between px-4"
            >
              <span className="flex items-center gap-3">
                {isLoading || isPending ? (
                  <span className="size-5 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                ) : (
                  <GoogleIcon className="size-5" />
                )}
                {isLoading || isPending
                  ? "Connecting…"
                  : "Continue with Google"}
              </span>
              <ArrowRight className="size-4" />
            </Button>

            <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
              Access is limited to authorized accounts.
            </p>
          </section>
        </div>

        <footer className="border-t border-border py-5 text-xs text-muted-foreground">
          Expense Tracker · {new Date().getFullYear()}
        </footer>
      </div>
    </main>
  );
}

function LoginLoading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background">
      <div className="size-8 animate-spin rounded-full border-2 border-primary border-r-transparent" />
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
