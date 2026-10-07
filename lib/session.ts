import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Session } from "./types";

const COOKIE = "nw_session";
const key = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret?.trim()) {
    throw new Error("SESSION_SECRET must be set before signing in.");
  }
  return new TextEncoder().encode(secret);
};

/** Issue a signed, httpOnly session cookie. Called only by the login action. */
export async function createSession(s: Session) {
  const token = await new SignJWT({ ...s })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(key());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/**
 * The single source of truth for "who is making this request".
 *
 * Note what it does NOT do: it never reads a role or a user id from the
 * request body or a query param. The identity comes only from the signed
 * cookie, so a caller cannot claim to be someone else.
 */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return { userId: payload.userId as string, role: payload.role as Session["role"], name: payload.name as string };
  } catch {
    return null;
  }
}
