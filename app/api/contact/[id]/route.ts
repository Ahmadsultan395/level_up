import Contact from "@/models/Contact";
import { getOneHandler, updateHandler, deleteHandler } from "@/lib/crudFactory";
import { requireAuth } from "@/lib/requireAuth";
import { NextRequest } from "next/server";

export const GET = requireAuth(getOneHandler(Contact) as any);
export const PUT = updateHandler(Contact); // used to toggle read/unread
export const DELETE = deleteHandler(Contact);
