import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { comparePassword, signToken, COOKIE_NAME } from "@/lib/auth";
import { ok, fail, serverError } from "@/lib/apiResponse";
import { loginSchema } from "@/validation/authValidation";

// Force Node.js runtime explicitly - this route uses jsonwebtoken and
// bcryptjs, which are NOT Edge-compatible. Route Handlers default to
// Node.js runtime already, but we pin it explicitly so it can never
// accidentally run on the Edge Runtime.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await loginSchema.validate(body);

    await connectDB();
    const user = await User.findOne({ email: body.email.toLowerCase() }).select("+password");
    if (!user) return fail("Invalid email or password", 401);

    const valid = await comparePassword(body.password, user.password);
    if (!valid) return fail("Invalid email or password", 401);

    const token = signToken({ id: user._id.toString(), email: user.email, name: user.name, role: user.role });

    const res = ok({ id: user._id, name: user.name, email: user.email, role: user.role });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
    return res;
  } catch (err: any) {
    if (err?.name === "ValidationError") return fail(err.message, 422);
    return serverError(err);
  }
}
