"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { contactSchema } from "@/validation/contactValidation";

const initialValues = { name: "", email: "", phone: "", message: "" };

export default function ContactForm() {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={contactSchema}
      onSubmit={async (values, { resetForm, setSubmitting }) => {
        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values)
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.message);
          toast.success("Message sent! We'll get back to you soon.");
          resetForm();
        } catch (err: any) {
          toast.error(err.message || "Failed to send message");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Name</label>
              <Field name="name" className="w-full rounded-xl border border-dark-100 px-4 py-3 text-sm focus:border-primary focus:outline-none" placeholder="Your name" />
              <ErrorMessage name="name" component="p" className="mt-1 text-xs text-red-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Email</label>
              <Field name="email" type="email" className="w-full rounded-xl border border-dark-100 px-4 py-3 text-sm focus:border-primary focus:outline-none" placeholder="you@example.com" />
              <ErrorMessage name="email" component="p" className="mt-1 text-xs text-red-500" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Phone (optional)</label>
            <Field name="phone" className="w-full rounded-xl border border-dark-100 px-4 py-3 text-sm focus:border-primary focus:outline-none" placeholder="+92 3XX XXXXXXX" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Message</label>
            <Field
              as="textarea"
              rows={5}
              name="message"
              className="w-full rounded-xl border border-dark-100 px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="Tell us about your project..."
            />
            <ErrorMessage name="message" component="p" className="mt-1 text-xs text-red-500" />
          </div>
          <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
            Send Message
          </Button>
        </Form>
      )}
    </Formik>
  );
}
