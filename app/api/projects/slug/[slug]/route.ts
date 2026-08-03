import Project from "@/models/Project";
import { getBySlugHandler } from "@/lib/getBySlug";

export const GET = getBySlugHandler(Project);
