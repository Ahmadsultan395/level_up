import Testimonial from "@/models/Testimonial";
import { getOneHandler, updateHandler, deleteHandler } from "@/lib/crudFactory";

export const GET = getOneHandler(Testimonial);
export const PUT = updateHandler(Testimonial);
export const DELETE = deleteHandler(Testimonial);
