import { NextRequest } from "next/server";
import Settings from "@/models/Settings";
import { connectDB } from "@/lib/mongodb";
import { ok, fail, serverError } from "@/lib/apiResponse";
import { requireAuth } from "@/lib/requireAuth";
import { settingsSchema } from "@/validation/settingsValidation";

// Public: site-wide settings used by navbar/footer/about page
export async function GET() {
  try {
    await connectDB();
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    return ok(settings);
  } catch (err) {
    return serverError(err);
  }
}

// Admin: update settings (upsert singleton)
export const PUT = requireAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    await settingsSchema.validate(body, { abortEarly: false });
    await connectDB();

    const existing = await Settings.findOne();
    const doc = existing
      ? await Settings.findByIdAndUpdate(existing._id, body, { new: true, runValidators: true })
      : await Settings.create(body);

    return ok(doc);
  } catch (err: any) {
    if (err?.name === "ValidationError") return fail(err.errors ? err.errors.join(", ") : err.message, 422);
    return serverError(err);
  }
});
