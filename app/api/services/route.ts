import Service from "@/models/Service";
import { listHandler, createHandler } from "@/lib/crudFactory";
import { serviceSchema } from "@/validation/serviceValidation";

export const GET = listHandler(Service, {
  searchFields: ["title", "category"],
  filterFields: ["category", "status"],
  defaultLimit: 12
});

export const POST = createHandler(Service, serviceSchema);
