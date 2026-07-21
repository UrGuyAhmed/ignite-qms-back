import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const ALLOWED_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

export function proxy(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return withCors(
      new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      })
    );
  }

  const { pathname } = request.nextUrl;

  // Protect the admin dashboard page
  const isDashboard = pathname.startsWith("/dashboard");

  // Protect only content MUTATIONS (POST/PUT/DELETE), not public GETs
  const isContentMutation =
    pathname.startsWith("/api/content") && request.method !== "GET";

  if (isDashboard || isContentMutation) {
    const token = request.cookies.get("session")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      if (isDashboard) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return withCors(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      );
    }
  }

  return withCors(NextResponse.next());
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*"],
};