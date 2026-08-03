import { Schema, models, model } from "mongoose";

export interface IJob {
  _id: string;
  jobTitle: string;
  slug: string;
  companyName: string;
  description: string; // rich text HTML
  requirements: string; // rich text HTML
  salary: string;
  location: string;
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote";
  posterImage: string;
  deadline: Date;
  status: "open" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    jobTitle: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    companyName: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    salary: { type: String, default: "" },
    location: { type: String, required: true },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
      default: "Full-time"
    },
    posterImage: { type: String, default: "" },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ["open", "closed"], default: "open" }
  },
  { timestamps: true }
);

JobSchema.pre("validate", function (next) {
  if (this.jobTitle && !this.slug) {
    this.slug = `${this.jobTitle}-${Date.now()}`
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

export default models.Job || model<IJob>("Job", JobSchema);
