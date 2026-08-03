import { Schema, models, model } from "mongoose";

export interface ITeamMember {
  _id: string;
  name: string;
  designation: string;
  bio: string; // rich text HTML
  photo: string;
  email: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  order: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true },
    bio: { type: String, default: "" },
    photo: { type: String, default: "" },
    email: { type: String, default: "" },
    socialLinks: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" }
    },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true }
);

export default models.Team || model<ITeamMember>("Team", TeamSchema);
