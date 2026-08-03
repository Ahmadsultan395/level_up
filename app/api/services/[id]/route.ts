import Service from "@/models/Service";
import { getOneHandler, updateHandler, deleteHandler } from "@/lib/crudFactory";
import { serviceSchema } from "@/validation/serviceValidation";

export const GET = getOneHandler(Service);
export const PUT = updateHandler(Service, serviceSchema);
export const DELETE = deleteHandler(Service);
