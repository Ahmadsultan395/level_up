/**
 * Run with: npm run seed
 * Creates the first admin user using SEED_ADMIN_* values from .env.local
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Settings from "../models/Settings";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in .env.local");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const email = (process.env.SEED_ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
  } else {
    const password = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!", 10);
    await User.create({
      name: process.env.SEED_ADMIN_NAME || "Admin",
      email,
      password,
      role: "superadmin"
    });
    console.log(`Admin user created: ${email}`);
  }

  const settings = await Settings.findOne();
  if (!settings) {
    await Settings.create({
      phone: "+92 300 0000000",
      email: "hello@youragency.com",
      address: "Your City, Pakistan",
      footerText: "We build digital products and experiences that help brands grow.",
      whyChooseUs: [
        { title: "Proven Expertise", description: "Years of experience delivering results.", icon: "ShieldCheck" },
        { title: "Fast Turnaround", description: "Agile process, quick delivery.", icon: "Zap" },
        { title: "Dedicated Team", description: "We treat your product like our own.", icon: "Users2" },
        { title: "Growth Focused", description: "Every decision tied to real impact.", icon: "TrendingUp" }
      ],
      process: [
        { title: "Discussion", description: "Understanding your goals and challenges." },
        { title: "Planning", description: "Mapping strategy, scope, and timeline." },
        { title: "Designing", description: "Wireframes and visual design." },
        { title: "Development", description: "Clean, scalable, well-tested code." },
        { title: "Delivery", description: "Launch, handover, and support." }
      ]
    });
    console.log("Default settings created");
  }

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
