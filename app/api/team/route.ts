import Team from "@/models/Team";
import { listHandler, createHandler } from "@/lib/crudFactory";
import { teamSchema } from "@/validation/teamValidation";

export const GET = listHandler(Team, {
  searchFields: ["name", "designation"],
  filterFields: ["status"],
  defaultSort: "order",
  defaultLimit: 50
});

export const POST = createHandler(Team, teamSchema);
