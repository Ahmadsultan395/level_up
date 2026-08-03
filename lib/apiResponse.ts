import { NextResponse } from "next/server";

export function ok<T>(data: T, meta?: any, status = 200) {
  return NextResponse.json({ success: true, data, ...(meta ? { meta } : {}) }, { status });
}

export function created<T>(data: T) {
  return ok(data, undefined, 201);
}

export function fail(message: string, status = 400, errors?: unknown) {
  return NextResponse.json({ success: false, message, ...(errors ? { errors } : {}) }, { status });
}

export function unauthorized(message = "Unauthorized") {
  return fail(message, 401);
}

export function notFound(message = "Not found") {
  return fail(message, 404);
}

export function serverError(err: unknown) {
  const message = err instanceof Error ? err.message : "Something went wrong";
  return fail(message, 500);
}
