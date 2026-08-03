import * as Yup from "yup";

const richTextRequired = (label: string) =>
  Yup.string()
    .test("min-html-length", `${label} is required`, (val) => !!val && val.replace(/<[^>]*>/g, "").trim().length > 0)
    .required(`${label} is required`);

export const jobSchema = Yup.object({
  jobTitle: Yup.string().min(3, "Too short").required("Job title is required"),
  companyName: Yup.string().required("Company name is required"),
  description: richTextRequired("Description"),
  requirements: richTextRequired("Requirements"),
  salary: Yup.string().default(""),
  location: Yup.string().required("Location is required"),
  jobType: Yup.string().oneOf(["Full-time", "Part-time", "Contract", "Internship", "Remote"]).required(),
  posterImage: Yup.string().default(""),
  deadline: Yup.date().min(new Date(), "Deadline must be in the future").required("Deadline is required"),
  status: Yup.string().oneOf(["open", "closed"]).required()
});

export type JobValues = Yup.InferType<typeof jobSchema>;

export const jobApplicationSchema = Yup.object({
  applicantName: Yup.string().min(3, "Too short").required("Name is required"),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  phone: Yup.string().min(7, "Enter a valid phone number").required("Phone is required"),
  message: Yup.string().max(1000, "Keep it under 1000 characters").default("")
});

export type JobApplicationValues = Yup.InferType<typeof jobApplicationSchema>;
