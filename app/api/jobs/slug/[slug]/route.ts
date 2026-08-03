import Job from "@/models/Job";
import { getBySlugHandler } from "@/lib/getBySlug";

export const GET = getBySlugHandler(Job);
