import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { COOKIE_NAME } from "./authConstants";

// Re-exported so existing imports of COOKIE_NAME from "@/lib/auth" keep working
// in Node.js runtime code (API routes, server components). Middleware must
// import COOKIE_NAME from "@/lib/authConstants" directly instead - see note there.
export { COOKIE_NAME };

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  // Fail loudly at startup instead of every sign/verify call throwing a
  // cryptic "secretOrPrivateKey must have a value" error later.
  throw new Error(
    "JWT_SECRET is not set. Add it to your .env.local file and restart the dev server.",
  );
}

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "superadmin";
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/** Read current session on the server (Server Components / Route Handlers - Node.js runtime) */
export async function getSession(): Promise<TokenPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Read session from a NextRequest (API route handlers - Node.js runtime only, NOT middleware) */
export function getSessionFromRequest(req: NextRequest): TokenPayload | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Roles allowed to perform a given action - extend here as roles grow */
export function hasRole(payload: TokenPayload | null, allowed: string[]) {
  if (!payload) return false;
  return allowed.includes(payload.role);
}
