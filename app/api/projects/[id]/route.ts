import Project from "@/models/Project";
import { getOneHandler, updateHandler, deleteHandler } from "@/lib/crudFactory";
import { projectSchema } from "@/validation/projectValidation";

export const GET = getOneHandler(Project);
export const PUT = updateHandler(Project, projectSchema);
export const DELETE = deleteHandler(Project);
