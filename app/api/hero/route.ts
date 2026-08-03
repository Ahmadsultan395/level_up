import { NextRequest } from "next/server";
import HeroSection from "@/models/HeroSection";
import { connectDB } from "@/lib/mongodb";
import { ok, fail, serverError } from "@/lib/apiResponse";
import { requireAuth } from "@/lib/requireAuth";
import { heroSchema } from "@/validation/heroValidation";

// Public: get the active hero content
export async function GET() {
  try {
    await connectDB();
    const hero = await HeroSection.findOne({ status: "active" }).sort("-createdAt");
    return ok(hero);
  } catch (err) {
    return serverError(err);
  }
}

// Admin: create/update the hero (upsert - one hero document drives the homepage)
export const PUT = requireAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    await heroSchema.validate(body, { abortEarly: false });
    await connectDB();

    const existing = await HeroSection.findOne();
    const doc = existing
      ? await HeroSection.findByIdAndUpdate(existing._id, body, { new: true, runValidators: true })
      : await HeroSection.create(body);

    return ok(doc);
  } catch (err: any) {
    if (err?.name === "ValidationError") return fail(err.errors ? err.errors.join(", ") : err.message, 422);
    return serverError(err);
  }
});
