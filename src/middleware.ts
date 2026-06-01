import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/api/auth"];
const adminRoutes = ["/admin"];

function logRequest(
  request: NextRequest,
  response: NextResponse,
  startedAt: number,
  reason: string,
) {
  const userAgent = request.headers.get("user-agent") || "";
  if (userAgent.startsWith("kube-probe")) {
    return response;
  }

  const durationMs = Date.now() - startedAt;
  const { pathname, search } = request.nextUrl;
  const log = {
    event: "frontend_request",
    method: request.method,
    path: `${pathname}${search}`,
    status: response.status,
    reason,
    duration_ms: durationMs,
  };

  console.log(JSON.stringify(log));
  return response;
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

function getBaseUrl(request: NextRequest): string {
  if (process.env.NODE_ENV === "production") {
    return "http://localhost:3000";
  }
  return request.nextUrl.origin;
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete("expense-tracker.session_token");
  response.cookies.delete("expense-tracker.session_data");
  return response;
}

export async function middleware(request: NextRequest) {
  const startedAt = Date.now();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/v1")) {
    return logRequest(
      request,
      NextResponse.next(),
      startedAt,
      "api_passthrough",
    );
  }

  if (isPublicRoute(pathname)) {
    return logRequest(request, NextResponse.next(), startedAt, "public");
  }

  const sessionCookie = getSessionCookie(request, {
    cookiePrefix: "expense-tracker",
  });

  if (!sessionCookie) {
    return logRequest(
      request,
      redirectToLogin(request, pathname),
      startedAt,
      "no_session",
    );
  }

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  if (!isAdminRoute) {
    return logRequest(request, NextResponse.next(), startedAt, "authenticated");
  }

  try {
    const baseUrl = getBaseUrl(request);
    const sessionResponse = await fetch(`${baseUrl}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (!sessionResponse.ok) {
      return logRequest(
        request,
        redirectToLogin(request, pathname),
        startedAt,
        "session_lookup_failed",
      );
    }

    const session = await sessionResponse.json();

    if (!session?.user) {
      return logRequest(
        request,
        redirectToLogin(request, pathname),
        startedAt,
        "missing_user",
      );
    }

    if (session.user.role !== "admin") {
      return logRequest(
        request,
        NextResponse.redirect(new URL("/dashboard", request.url)),
        startedAt,
        "forbidden_role",
      );
    }

    return logRequest(request, NextResponse.next(), startedAt, "authorized");
  } catch (error) {
    console.error("Middleware auth error:", error);
    return logRequest(
      request,
      redirectToLogin(request, pathname),
      startedAt,
      "auth_error",
    );
  }
}

export const config = {
  matcher: [
    "/((?!api/v1|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
