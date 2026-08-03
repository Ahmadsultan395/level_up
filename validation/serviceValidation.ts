import * as Yup from "yup";

export const serviceSchema = Yup.object({
  title: Yup.string().min(3, "Too short").required("Title is required"),
  description: Yup.string()
    .test("min-html-length", "Description is required", (val) => !!val && val.replace(/<[^>]*>/g, "").trim().length > 0)
    .required("Description is required"),
  icon: Yup.string().default(""),
  category: Yup.string().required("Category is required"),
  status: Yup.string().oneOf(["active", "inactive"]).required()
});

export type ServiceValues = Yup.InferType<typeof serviceSchema>;
