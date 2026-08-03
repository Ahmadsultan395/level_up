import { Schema, models, model } from "mongoose";

export interface IService {
  _id: string;
  title: string;
  slug: string;
  description: string; // rich text HTML
  icon: string;
  category: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    icon: { type: String, default: "" },
    category: { type: String, default: "General" },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true }
);

ServiceSchema.pre("validate", function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

export default models.Service || model<IService>("Service", ServiceSchema);
