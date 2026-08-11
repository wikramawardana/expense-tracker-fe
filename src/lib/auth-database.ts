const ALLOWED_AUTH_DATABASES = new Set([
  "expense_tracker_auth",
  "expense_tracker_auth_dev",
]);

export function requireIsolatedAuthDatabase(
  connectionString: string | undefined,
): string {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  let databaseName: string;
  try {
    databaseName = new URL(connectionString).pathname.replace(/^\//, "");
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL URL");
  }

  if (!ALLOWED_AUTH_DATABASES.has(databaseName)) {
    throw new Error(
      "Expense Tracker DATABASE_URL must point to its dedicated auth database",
    );
  }

  return connectionString;
}
