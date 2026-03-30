"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
    CategoriesTable,
    CreateCategoryDialog,
} from "@/components/categories";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/lib/auth-client";
import { getCategories } from "@/services/categories.service";
import type { Category } from "@/types/category.types";

export default function CategoriesPage() {
    const router = useRouter();
    const { data: session, isPending: isSessionLoading } = useSession();

    const [categories, setCategories] = React.useState<Category[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    // Track if user is authenticated
    const isAuthenticated = !!session?.user;

    // Check authentication and redirect if not logged in
    React.useEffect(() => {
        if (!isSessionLoading && !session?.user) {
            router.replace(`/login?callbackUrl=${encodeURIComponent("/categories")}`);
        }
    }, [session, isSessionLoading, router]);

    const fetchCategories = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getCategories();
            setCategories(response.data);
        } catch (error) {
            // Don't show toast for auth errors - let the redirect handle it
            if (error instanceof Error && error.message.includes("401")) {
                return;
            }
            toast.error(
                error instanceof Error ? error.message : "Failed to fetch categories",
            );
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch data when authenticated
    React.useEffect(() => {
        if (!isAuthenticated) return;
        fetchCategories();
    }, [isAuthenticated, fetchCategories]);

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
                    { label: "Categories" },
                ]}
            />

            <main className="p-4 sm:p-6 space-y-4">
                {/* Top Section: Title + Create Button */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                            Categories
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground font-bold">
                            Manage your expense categories
                        </p>
                    </div>
                    <CreateCategoryDialog onCategoryCreated={fetchCategories} />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-bold text-muted-foreground uppercase">
                                Total Categories
                            </div>
                            <div className="text-2xl font-black">
                                {isLoading ? "-" : categories.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-bold text-muted-foreground uppercase">
                                Active
                            </div>
                            <div className="text-2xl font-black text-green-600">
                                {isLoading ? "-" : categories.filter((c) => c.is_active).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-bold text-muted-foreground uppercase">
                                Inactive
                            </div>
                            <div className="text-2xl font-black text-gray-500">
                                {isLoading ? "-" : categories.filter((c) => !c.is_active).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Categories Table */}
                <Card>
                    <CardContent className="p-4">
                        <CategoriesTable
                            categories={categories}
                            isLoading={isLoading}
                            onCategoryUpdated={fetchCategories}
                            onCategoryDeleted={fetchCategories}
                        />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
