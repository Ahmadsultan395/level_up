import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";
import type { ISettings } from "@/models/Settings";

export async function getSettings(): Promise<ISettings | null> {
  try {
    await connectDB();
    const settings = await Settings.findOne().lean<ISettings>();
    return settings || null;
  } catch {
    return null;
  }
}
