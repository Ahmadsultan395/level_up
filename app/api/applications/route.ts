import { NextRequest } from "next/server";
import Application from "@/models/Application";
import Job from "@/models/Job";
import { listHandler } from "@/lib/crudFactory";
import { requireAuth } from "@/lib/requireAuth";
import { connectDB } from "@/lib/mongodb";
import { created, fail, serverError } from "@/lib/apiResponse";
import { jobApplicationSchema } from "@/validation/jobValidation";

// Admin-only: view all applicants
export const GET = requireAuth(
  listHandler(Application, { searchFields: ["applicantName", "email"], populate: "appliedJob", defaultLimit: 20 }) as any
);

// Public: submit a job application (cvUrl comes from /api/upload)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await jobApplicationSchema.validate(body, { abortEarly: false });
    if (!body.cvUrl) return fail("CV is required", 422);
    if (!body.appliedJob) return fail("appliedJob is required", 422);

    await connectDB();
    const job = await Job.findById(body.appliedJob);
    if (!job) return fail("Job not found", 404);

    const doc = await Application.create(body);
    return created(doc);
  } catch (err: any) {
    if (err?.name === "ValidationError") return fail(err.errors ? err.errors.join(", ") : err.message, 422);
    return serverError(err);
  }
}
