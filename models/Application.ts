import { Schema, models, model, Types } from "mongoose";

export interface IApplication {
  _id: string;
  applicantName: string;
  email: string;
  phone: string;
  cvUrl: string;
  message: string;
  appliedJob: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    applicantName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    cvUrl: { type: String, required: true },
    message: { type: String, default: "" },
    appliedJob: { type: Schema.Types.ObjectId, ref: "Job", required: true }
  },
  { timestamps: true }
);

export default models.Application || model<IApplication>("Application", ApplicationSchema);
