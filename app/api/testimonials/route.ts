import Testimonial from "@/models/Testimonial";
import { listHandler, createHandler } from "@/lib/crudFactory";

export const GET = listHandler(Testimonial, { filterFields: ["status"], defaultLimit: 20 });
export const POST = createHandler(Testimonial);
