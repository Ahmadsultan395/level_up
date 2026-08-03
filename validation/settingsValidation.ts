import * as Yup from "yup";

export const settingsSchema = Yup.object({
  logo: Yup.string().default(""),
  phone: Yup.string().required("Phone is required"),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  address: Yup.string().required("Address is required"),
  footerText: Yup.string().default(""),
  socialLinks: Yup.object({
    facebook: Yup.string().default(""),
    instagram: Yup.string().default(""),
    linkedin: Yup.string().default(""),
    twitter: Yup.string().default(""),
    youtube: Yup.string().default("")
  }),
  aboutStory: Yup.string().default(""),
  aboutMission: Yup.string().default(""),
  aboutVision: Yup.string().default(""),
  whyChooseUs: Yup.array().of(
    Yup.object({
      title: Yup.string().required(),
      description: Yup.string().required(),
      icon: Yup.string().default("")
    })
  ),
  process: Yup.array().of(
    Yup.object({
      title: Yup.string().required(),
      description: Yup.string().required()
    })
  )
});

export type SettingsValues = Yup.InferType<typeof settingsSchema>;
