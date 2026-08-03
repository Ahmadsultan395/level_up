import { NextRequest } from "next/server";
import Contact from "@/models/Contact";
import { listHandler } from "@/lib/crudFactory";
import { requireAuth } from "@/lib/requireAuth";
import { connectDB } from "@/lib/mongodb";
import { created, fail, serverError } from "@/lib/apiResponse";
import { contactSchema } from "@/validation/contactValidation";

// Admin-only: view all contact messages
export const GET = requireAuth(listHandler(Contact, { searchFields: ["name", "email"], defaultLimit: 20 }) as any);

// Public: submit contact form
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await contactSchema.validate(body, { abortEarly: false });
    await connectDB();
    const doc = await Contact.create(body);
    return created(doc);
  } catch (err: any) {
    if (err?.name === "ValidationError") return fail(err.errors ? err.errors.join(", ") : err.message, 422);
    return serverError(err);
  }
}
