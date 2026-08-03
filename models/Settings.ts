import { Schema, models, model } from "mongoose";

export interface IProcessStep {
  title: string;
  description: string;
}

export interface IWhyChooseUsItem {
  title: string;
  description: string;
  icon: string;
}

export interface ISettings {
  _id: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  footerText: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  // About page (dynamic content, rich text)
  aboutStory: string;
  aboutMission: string;
  aboutVision: string;
  // Why choose us + process (editable repeatable blocks)
  whyChooseUs: IWhyChooseUsItem[];
  process: IProcessStep[];
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    logo: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    footerText: { type: String, default: "" },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      youtube: { type: String, default: "" }
    },
    aboutStory: { type: String, default: "" },
    aboutMission: { type: String, default: "" },
    aboutVision: { type: String, default: "" },
    whyChooseUs: [
      {
        title: String,
        description: String,
        icon: String
      }
    ],
    process: [
      {
        title: String,
        description: String
      }
    ]
  },
  { timestamps: true }
);

export default models.Settings || model<ISettings>("Settings", SettingsSchema);
