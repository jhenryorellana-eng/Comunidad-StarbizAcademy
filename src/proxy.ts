import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Next.js 16: middleware was renamed to "proxy" and now runs on the Node.js
// runtime by default, so jose (and any Node API) works here.
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "insecure-dev-secret",
);
const COOKIE = process.env.AUTH_COOKIE_NAME || "sba_session";

async function getRole(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = await getRole(req);

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
