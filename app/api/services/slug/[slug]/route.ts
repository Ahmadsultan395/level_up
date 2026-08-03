import Service from "@/models/Service";
import { getBySlugHandler } from "@/lib/getBySlug";

export const GET = getBySlugHandler(Service);
