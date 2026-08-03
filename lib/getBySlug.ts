import { NextRequest } from "next/server";
import { Model } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { ok, fail, serverError } from "@/lib/apiResponse";

export function getBySlugHandler(model: Model<any>) {
  return async (_req: NextRequest, { params }: { params: { slug: string } }) => {
    try {
      await connectDB();
      const doc = await model.findOne({ slug: params.slug });
      if (!doc) return fail("Not found", 404);
      return ok(doc);
    } catch (err) {
      return serverError(err);
    }
  };
}
