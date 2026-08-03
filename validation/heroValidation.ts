import * as Yup from "yup";

export const heroSchema = Yup.object({
  heading: Yup.string().min(5, "Too short").required("Heading is required"),
  description: Yup.string()
    .test("min-html-length", "Description is required", (val) => !!val && val.replace(/<[^>]*>/g, "").trim().length > 0)
    .required("Description is required"),
  buttonText: Yup.string().required("Button text is required"),
  buttonLink: Yup.string().required("Button link is required"),
  bannerImage: Yup.string().default(""),
  status: Yup.string().oneOf(["active", "inactive"]).required()
});

export type HeroValues = Yup.InferType<typeof heroSchema>;
