import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-100 via-orange-100 to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="text-center space-y-6">
        <div className="text-6xl">🚫</div>
        <h1 className="text-3xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground max-w-md">
          You don&apos;t have permission to access this page. Please contact an
          administrator if you believe this is an error.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
