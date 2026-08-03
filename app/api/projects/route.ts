import Project from "@/models/Project";
import { listHandler, createHandler } from "@/lib/crudFactory";
import { projectSchema } from "@/validation/projectValidation";

export const GET = listHandler(Project, {
  searchFields: ["title", "clientName"],
  filterFields: ["category"],
  defaultLimit: 9
});

export const POST = createHandler(Project, projectSchema);
