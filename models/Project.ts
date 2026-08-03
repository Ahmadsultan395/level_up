import { Schema, models, model } from "mongoose";

export interface IProject {
  _id: string;
  title: string;
  slug: string;
  description: string; // rich text HTML
  category: string;
  image: string;
  clientName: string;
  projectLink: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, default: "" },
    clientName: { type: String, default: "" },
    projectLink: { type: String, default: "" }
  },
  { timestamps: true }
);

ProjectSchema.pre("validate", function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

export default models.Project || model<IProject>("Project", ProjectSchema);
