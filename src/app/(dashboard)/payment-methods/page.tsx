"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
    PaymentMethodsTable,
    CreatePaymentMethodDialog,
} from "@/components/payment-methods";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/lib/auth-client";
import { getPaymentMethods } from "@/services/payment-methods.service";
import type { PaymentMethod } from "@/types/payment-method.types";

export default function PaymentMethodsPage() {
    const router = useRouter();
    const { data: session, isPending: isSessionLoading } = useSession();

    const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    // Track if user is authenticated
    const isAuthenticated = !!session?.user;

    // Check authentication and redirect if not logged in
    React.useEffect(() => {
        if (!isSessionLoading && !session?.user) {
            router.replace(`/login?callbackUrl=${encodeURIComponent("/payment-methods")}`);
        }
    }, [session, isSessionLoading, router]);

    const fetchPaymentMethods = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getPaymentMethods();
            setPaymentMethods(response.data);
        } catch (error) {
            // Don't show toast for auth errors - let the redirect handle it
            if (error instanceof Error && error.message.includes("401")) {
                return;
            }
            toast.error(
                error instanceof Error ? error.message : "Failed to fetch payment methods",
            );
            setPaymentMethods([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch data when authenticated
    React.useEffect(() => {
        if (!isAuthenticated) return;
        fetchPaymentMethods();
    }, [isAuthenticated, fetchPaymentMethods]);

    // Calculate stats by type
    const creditCardCount = React.useMemo(
        () => paymentMethods.filter((pm) => pm.method_type === "credit_card" && pm.is_active).length,
        [paymentMethods]
    );

    const cashCount = React.useMemo(
        () => paymentMethods.filter((pm) => pm.method_type === "cash" && pm.is_active).length,
        [paymentMethods]
    );

    const otherCount = React.useMemo(
        () => paymentMethods.filter((pm) => !["credit_card", "cash"].includes(pm.method_type) && pm.is_active).length,
        [paymentMethods]
    );

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
                    { label: "Payment Methods" },
                ]}
            />

            <main className="p-4 sm:p-6 space-y-4">
                {/* Top Section: Title + Create Button */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                            Payment Methods
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground font-bold">
                            Manage your payment methods
                        </p>
                    </div>
                    <CreatePaymentMethodDialog onPaymentMethodCreated={fetchPaymentMethods} />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-bold text-muted-foreground uppercase">
                                Total Methods
                            </div>
                            <div className="text-2xl font-black">
                                {isLoading ? "-" : paymentMethods.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-bold text-muted-foreground uppercase">
                                💳 Credit Cards
                            </div>
                            <div className="text-2xl font-black text-blue-600">
                                {isLoading ? "-" : creditCardCount}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-bold text-muted-foreground uppercase">
                                💵 Cash
                            </div>
                            <div className="text-2xl font-black text-green-600">
                                {isLoading ? "-" : cashCount}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-bold text-muted-foreground uppercase">
                                📱 Others
                            </div>
                            <div className="text-2xl font-black text-purple-600">
                                {isLoading ? "-" : otherCount}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payment Methods Table */}
                <Card>
                    <CardContent className="p-4">
                        <PaymentMethodsTable
                            paymentMethods={paymentMethods}
                            isLoading={isLoading}
                            onPaymentMethodUpdated={fetchPaymentMethods}
                            onPaymentMethodDeleted={fetchPaymentMethods}
                        />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
