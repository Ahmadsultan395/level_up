import { NextRequest } from "next/server";
import { getSessionFromRequest, TokenPayload } from "./auth";

/**
 * Wrap a route handler to require a valid admin session.
 * Usage: export const POST = requireAuth(async (req, session) => { ... })
 */
export function requireAuth(
  handler: (req: NextRequest, session: TokenPayload, ctx?: any) => Promise<Response>,
  allowedRoles: string[] = ["superadmin", "admin", "editor"]
) {
  return async (req: NextRequest, ctx?: any) => {
    const session = getSessionFromRequest(req);
    if (!session || !allowedRoles.includes(session.role)) {
      return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return handler(req, session, ctx);
  };
}
