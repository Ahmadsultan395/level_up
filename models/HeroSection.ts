import { Schema, models, model } from "mongoose";

export interface IHeroSection {
  _id: string;
  heading: string;
  description: string; // rich text HTML
  buttonText: string;
  buttonLink: string;
  bannerImage: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const HeroSectionSchema = new Schema<IHeroSection>(
  {
    heading: { type: String, required: true },
    description: { type: String, required: true }, // stored as HTML from rich editor
    buttonText: { type: String, default: "Get Started" },
    buttonLink: { type: String, default: "/contact" },
    bannerImage: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true }
);

export default models.HeroSection || model<IHeroSection>("HeroSection", HeroSectionSchema);
