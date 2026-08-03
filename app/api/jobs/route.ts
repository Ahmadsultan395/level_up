import Job from "@/models/Job";
import { listHandler, createHandler } from "@/lib/crudFactory";
import { jobSchema } from "@/validation/jobValidation";

export const GET = listHandler(Job, {
  searchFields: ["jobTitle", "companyName", "location"],
  filterFields: ["jobType", "status", "location"],
  defaultLimit: 9
});

export const POST = createHandler(Job, jobSchema);
