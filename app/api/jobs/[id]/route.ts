import Job from "@/models/Job";
import { getOneHandler, updateHandler, deleteHandler } from "@/lib/crudFactory";
import { jobSchema } from "@/validation/jobValidation";

export const GET = getOneHandler(Job);
export const PUT = updateHandler(Job, jobSchema);
export const DELETE = deleteHandler(Job);
