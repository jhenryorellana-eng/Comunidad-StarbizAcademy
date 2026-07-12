import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { MEMBER_ROLES, ROLES, type Role } from "./constants";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "sba_session";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "insecure-dev-secret",
);

export type SessionPayload = {
  sub: string; // user id
  role: Role;
  name: string;
  email: string;
};

// ---- password hashing ----
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ---- JWT ----
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, name: payload.name, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    return {
      sub: payload.sub as string,
      role: (payload.role as Role) ?? ROLES.MEMBER,
      name: (payload.name as string) ?? "",
      email: (payload.email as string) ?? "",
    };
  } catch {
    return null;
  }
}

// ---- cookie helpers (call only in route handlers / server actions) ----
export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

// ---- read session in server components / handlers ----
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      country: true,
      building: true,
      createdAt: true,
    },
  });
}

export function isMember(role?: string | null): boolean {
  return !!role && MEMBER_ROLES.includes(role as Role);
}
export function isAdmin(role?: string | null): boolean {
  return role === ROLES.ADMIN;
}

export { COOKIE_NAME };
