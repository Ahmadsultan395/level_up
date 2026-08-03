import Application from "@/models/Application";
import { getOneHandler, deleteHandler } from "@/lib/crudFactory";
import { requireAuth } from "@/lib/requireAuth";

export const GET = requireAuth(getOneHandler(Application, "appliedJob") as any);
export const DELETE = deleteHandler(Application);
