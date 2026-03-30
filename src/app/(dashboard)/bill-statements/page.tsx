"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
    BillStatementsTable,
    CreateBillStatementDialog,
} from "@/components/bill-statements";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/lib/auth-client";
import { getBillStatements } from "@/services/bill-statements.service";
import type { BillStatement } from "@/types/bill-statement.types";

export default function BillStatementsPage() {
    const router = useRouter();
    const { data: session, isPending: isSessionLoading } = useSession();

    const [billStatements, setBillStatements] = React.useState<BillStatement[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    // Track if user is authenticated
    const isAuthenticated = !!session?.user;

    // Check authentication and redirect if not logged in
    React.useEffect(() => {
        if (!isSessionLoading && !session?.user) {
            router.replace(`/login?callbackUrl=${encodeURIComponent("/bill-statements")}`);
        }
    }, [session, isSessionLoading, router]);

    const fetchBillStatements = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getBillStatements();
            setBillStatements(response.data);
        } catch (error) {
            // Don't show toast for auth errors - let the redirect handle it
            if (error instanceof Error && error.message.includes("401")) {
                return;
            }
            toast.error(
                error instanceof Error ? error.message : "Failed to fetch bill statements",
            );
            setBillStatements([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch data when authenticated
    React.useEffect(() => {
        if (!isAuthenticated) return;
        fetchBillStatements();
    }, [isAuthenticated, fetchBillStatements]);

    // Calculate stats
    const overdueCount = React.useMemo(() => {
        const now = new Date();
        return billStatements.filter(
            (bs) => bs.due_date && new Date(bs.due_date) < now && bs.is_active
        ).length;
    }, [billStatements]);

    // Show loading state while checking session
    if (isSessionLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="inline-block h-10 w-10 animate-spin border-4 border-solid border-foreground border-r-transparent" />
            </div>
        );
    }

    // Don't render content if not authenticated (redirect is happening)
    if (!session?.user) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="inline-block h-10 w-10 animate-spin border-4 border-solid border-foreground border-r-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <PageHeader
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Bill Statements" },
                ]}
            />

            <main className="p-4 sm:p-6 space-y-4">
                {/* Top Section: Title + Create Button */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                            Bill Statements
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground font-bold">
                            Manage your bill statements and due dates
                        </p>
                    </div>
                    <CreateBillStatementDialog onBillStatementCreated={fetchBillStatements} />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-bold text-muted-foreground uppercase">
                                Total Statements
                            </div>
                            <div className="text-2xl font-black">
                                {isLoading ? "-" : billStatements.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-bold text-muted-foreground uppercase">
                                Active
                            </div>
                            <div className="text-2xl font-black text-green-600">
                                {isLoading ? "-" : billStatements.filter((bs) => bs.is_active).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-bold text-muted-foreground uppercase">
                                Inactive
                            </div>
                            <div className="text-2xl font-black text-gray-500">
                                {isLoading ? "-" : billStatements.filter((bs) => !bs.is_active).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-bold text-muted-foreground uppercase">
                                Overdue
                            </div>
                            <div className="text-2xl font-black text-red-600">
                                {isLoading ? "-" : overdueCount}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bill Statements Table */}
                <Card>
                    <CardContent className="p-4">
                        <BillStatementsTable
                            billStatements={billStatements}
                            isLoading={isLoading}
                            onBillStatementUpdated={fetchBillStatements}
                            onBillStatementDeleted={fetchBillStatements}
                        />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
