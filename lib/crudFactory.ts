import { NextRequest } from "next/server";
import { Model } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { ok, created, fail, serverError } from "@/lib/apiResponse";
import { requireAuth } from "@/lib/requireAuth";

interface ListOptions {
  searchFields?: string[];
  filterFields?: string[];
  defaultSort?: string;
  defaultLimit?: number;
  populate?: string;
}

/** GET /api/resource - public list with search, filter, pagination */
export function listHandler(model: Model<any>, options: ListOptions = {}) {
  return async (req: NextRequest) => {
    try {
      await connectDB();
      const { searchParams } = new URL(req.url);
      const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
      const limit = Math.max(1, parseInt(searchParams.get("limit") || String(options.defaultLimit || 9)));
      const query: Record<string, any> = {};

      const search = searchParams.get("search");
      if (search && options.searchFields?.length) {
        query.$or = options.searchFields.map((f) => ({ [f]: { $regex: search, $options: "i" } }));
      }

      for (const field of options.filterFields || []) {
        const val = searchParams.get(field);
        if (val) query[field] = val;
      }

      let cursor = model
        .find(query)
        .sort(options.defaultSort || "-createdAt")
        .skip((page - 1) * limit)
        .limit(limit);

      if (options.populate) cursor = cursor.populate(options.populate) as any;

      const [items, total] = await Promise.all([cursor, model.countDocuments(query)]);

      return ok(items, { total, page, pages: Math.ceil(total / limit) || 1, limit });
    } catch (err) {
      return serverError(err);
    }
  };
}

/** POST /api/resource - protected create */
export function createHandler(model: Model<any>, schema?: { validate: (v: any) => Promise<any> }) {
  return requireAuth(async (req: NextRequest) => {
    try {
      await connectDB();
      const body = await req.json();
      if (schema) await schema.validate(body, { abortEarly: false });
      const doc = await model.create(body);
      return created(doc);
    } catch (err: any) {
      if (err?.name === "ValidationError") return fail(err.errors ? err.errors.join(", ") : err.message, 422);
      if (err?.code === 11000) return fail("A record with this value already exists", 409);
      return serverError(err);
    }
  }, ["superadmin", "admin", "editor"]);
}

/** GET /api/resource/[id] - public single item */
export function getOneHandler(model: Model<any>, populate?: string) {
  return async (_req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      await connectDB();
      let cursor = model.findById(params.id);
      if (populate) cursor = cursor.populate(populate) as any;
      const doc = await cursor;
      if (!doc) return fail("Not found", 404);
      return ok(doc);
    } catch (err) {
      return serverError(err);
    }
  };
}

/** PUT /api/resource/[id] - protected update */
export function updateHandler(model: Model<any>, schema?: { validate: (v: any) => Promise<any> }) {
  return requireAuth(async (req: NextRequest, _session, { params }: { params: { id: string } }) => {
    try {
      await connectDB();
      const body = await req.json();
      if (schema) await schema.validate(body, { abortEarly: false });
      const doc = await model.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
      if (!doc) return fail("Not found", 404);
      return ok(doc);
    } catch (err: any) {
      if (err?.name === "ValidationError") return fail(err.errors ? err.errors.join(", ") : err.message, 422);
      return serverError(err);
    }
  });
}

/** DELETE /api/resource/[id] - protected delete */
export function deleteHandler(model: Model<any>) {
  return requireAuth(async (_req: NextRequest, _session, { params }: { params: { id: string } }) => {
    try {
      await connectDB();
      const doc = await model.findByIdAndDelete(params.id);
      if (!doc) return fail("Not found", 404);
      return ok({ deleted: true });
    } catch (err) {
      return serverError(err);
    }
  });
}
