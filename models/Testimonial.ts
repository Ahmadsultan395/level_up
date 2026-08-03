import { Schema, models, model } from "mongoose";

export interface ITestimonial {
  _id: string;
  clientName: string;
  clientRole: string;
  clientPhoto: string;
  feedback: string; // rich text HTML
  rating: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    clientName: { type: String, required: true },
    clientRole: { type: String, default: "" },
    clientPhoto: { type: String, default: "" },
    feedback: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true }
);

export default models.Testimonial || model<ITestimonial>("Testimonial", TestimonialSchema);
