import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { ok, fail, serverError } from "@/lib/apiResponse";

const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOC = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const kind = (formData.get("kind") as string) || "image"; // "image" | "document"

    if (!file) return fail("No file provided", 400);
    if (file.size > MAX_SIZE) return fail("File must be under 5MB", 400);

    const allowed = kind === "document" ? [...ALLOWED_DOC] : ALLOWED_IMAGE;
    if (!allowed.includes(file.type)) return fail(`Invalid file type: ${file.type}`, 400);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || (kind === "document" ? ".pdf" : ".jpg");
    const filename = `${kind}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    await writeFile(path.join(uploadsDir, filename), buffer);

    return ok({ url: `/uploads/${filename}` });
  } catch (err) {
    return serverError(err);
  }
}
