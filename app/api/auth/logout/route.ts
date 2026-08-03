import { ok } from "@/lib/apiResponse";
import { COOKIE_NAME } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const res = ok({ message: "Logged out" });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
