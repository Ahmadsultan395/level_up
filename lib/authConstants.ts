// This file must stay dependency-free of Node-only packages (jsonwebtoken,
// bcryptjs, next/headers) so middleware.ts (Edge Runtime) can safely import
// COOKIE_NAME without pulling those Node-only modules into the Edge bundle.

export const COOKIE_NAME = process.env.COOKIE_NAME || "agency_admin_token";
