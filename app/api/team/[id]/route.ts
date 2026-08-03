import Team from "@/models/Team";
import { getOneHandler, updateHandler, deleteHandler } from "@/lib/crudFactory";
import { teamSchema } from "@/validation/teamValidation";

export const GET = getOneHandler(Team);
export const PUT = updateHandler(Team, teamSchema);
export const DELETE = deleteHandler(Team);
