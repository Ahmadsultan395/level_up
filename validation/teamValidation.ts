import * as Yup from "yup";

export const teamSchema = Yup.object({
  name: Yup.string().min(2, "Too short").required("Name is required"),
  designation: Yup.string().required("Designation is required"),
  bio: Yup.string().default(""),
  photo: Yup.string().default(""),
  email: Yup.string().email("Enter a valid email").nullable().notRequired(),
  socialLinks: Yup.object({
    linkedin: Yup.string().default(""),
    twitter: Yup.string().default(""),
    instagram: Yup.string().default(""),
    facebook: Yup.string().default("")
  }),
  order: Yup.number().default(0),
  status: Yup.string().oneOf(["active", "inactive"]).required()
});

export type TeamValues = Yup.InferType<typeof teamSchema>;
