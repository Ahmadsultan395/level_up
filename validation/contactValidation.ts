import * as Yup from "yup";

export const contactSchema = Yup.object({
  name: Yup.string().min(2, "Too short").required("Name is required"),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  phone: Yup.string().default(""),
  message: Yup.string().min(10, "Message is too short").required("Message is required")
});

export type ContactValues = Yup.InferType<typeof contactSchema>;
