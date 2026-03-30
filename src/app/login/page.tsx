"use client";

import { Wallet } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient, useSession } from "@/lib/auth-client";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
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
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            window.location.href = callbackUrl;
          }
        })
        .catch(() => {});
    }
  }, [session, isPending, callbackUrl]);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.oauth2({
        providerId: "wikra-auth",
        callbackURL: callbackUrl,
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FFE156] p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#FF88DC] border-3 border-foreground" />
        <div className="absolute top-40 right-32 w-24 h-24 bg-[#7DF9FF] border-3 border-foreground" />
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-[#A3E636] border-3 border-foreground" />
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-[#88AAEE] border-3 border-foreground" />
      </div>

      <Card className="w-full max-w-md relative z-10 bg-background">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-20 h-20 bg-[#A3E636] border-3 border-foreground flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <Wallet className="w-10 h-10 text-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl font-black uppercase tracking-tight">
              Expense Tracker
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Track your expenses and manage your finances
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Button
            onClick={handleSignIn}
            disabled={isLoading || isPending}
            className="w-full h-14 text-base"
            variant="outline"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-3 border-foreground border-t-transparent animate-spin" />
                <span className="font-black uppercase">Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <GoogleIcon className="w-6 h-6" />
                <span className="font-black uppercase">Continue with Google</span>
              </div>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Secured by Wikra Auth.
          </p>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase border-b-2 border-transparent hover:border-foreground"
            >
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FFE156]">
          <div className="w-10 h-10 border-4 border-foreground border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
