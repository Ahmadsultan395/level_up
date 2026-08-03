"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import toast from "react-hot-toast";
import { UploadCloud, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jobApplicationSchema } from "@/validation/jobValidation";

export default function JobApplyForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const router = useRouter();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  return (
    <Formik
      initialValues={{ applicantName: "", email: "", phone: "", message: "" }}
      validationSchema={jobApplicationSchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        if (!cvFile) {
          toast.error("Please upload your CV");
          setSubmitting(false);
          return;
        }
        try {
          setUploading(true);
          const fd = new FormData();
          fd.append("file", cvFile);
          fd.append("kind", "document");
          const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
          const uploadData = await uploadRes.json();
          if (!uploadData.success) throw new Error(uploadData.message);
          setUploading(false);

          const res = await fetch("/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...values, cvUrl: uploadData.data.url, appliedJob: jobId })
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.message);

          toast.success("Application submitted successfully!");
          resetForm();
          setCvFile(null);
          router.push("/jobs");
        } catch (err: any) {
          toast.error(err.message || "Failed to submit application");
        } finally {
          setSubmitting(false);
          setUploading(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Full Name</label>
              <Field name="applicantName" className="w-full rounded-xl border border-dark-100 px-4 py-3 text-sm focus:border-primary focus:outline-none" />
              <ErrorMessage name="applicantName" component="p" className="mt-1 text-xs text-red-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Email</label>
              <Field name="email" type="email" className="w-full rounded-xl border border-dark-100 px-4 py-3 text-sm focus:border-primary focus:outline-none" />
              <ErrorMessage name="email" component="p" className="mt-1 text-xs text-red-500" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Phone</label>
            <Field name="phone" className="w-full rounded-xl border border-dark-100 px-4 py-3 text-sm focus:border-primary focus:outline-none" />
            <ErrorMessage name="phone" component="p" className="mt-1 text-xs text-red-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Cover Message (optional)</label>
            <Field as="textarea" rows={4} name="message" className="w-full rounded-xl border border-dark-100 px-4 py-3 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Upload CV (PDF/DOC, max 5MB)</label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-dark-100 px-4 py-8 text-sm text-dark-300 hover:border-primary">
              {cvFile ? <FileCheck size={18} className="text-primary" /> : <UploadCloud size={18} />}
              {cvFile ? cvFile.name : "Click to select your CV"}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
          <Button type="submit" loading={isSubmitting || uploading} className="w-full">
            Submit Application for {jobTitle}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
