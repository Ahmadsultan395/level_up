import * as Yup from "yup";

export const projectSchema = Yup.object({
  title: Yup.string().min(3, "Too short").required("Title is required"),
  description: Yup.string()
    .test("min-html-length", "Description is required", (val) => !!val && val.replace(/<[^>]*>/g, "").trim().length > 0)
    .required("Description is required"),
  category: Yup.string().required("Category is required"),
  image: Yup.string().default(""),
  clientName: Yup.string().default(""),
  projectLink: Yup.string().url("Enter a valid URL").nullable().notRequired()
});

export type ProjectValues = Yup.InferType<typeof projectSchema>;
