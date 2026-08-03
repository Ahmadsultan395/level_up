"use client";

import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/common/RichTextEditor";
import ImageUploadField from "@/components/admin/ImageUploadField";
import Loader from "@/components/common/Loader";
import { heroSchema } from "@/validation/heroValidation";

const emptyValues = {
  heading: "",
  description: "",
  buttonText: "Get Started",
  buttonLink: "/contact",
  bannerImage: "",
  status: "active" as const,
};

export default function HeroAdminPage() {
  const [initial, setInitial] = useState<typeof emptyValues | null>(null);

  useEffect(() => {
    fetch("/api/hero")
      .then((res) => res.json())
      .then((data) =>
        setInitial(data.success && data.data ? data.data : emptyValues),
      );
  }, []);

  if (!initial) return <Loader fullscreen />;

  return (
    <div>
      <AdminPageHeader
        title="Hero Section"
        description="Content shown at the top of your homepage"
      />

      <div className="w-full rounded-2xl border border-dark-100 bg-white p-7">
        <Formik
          initialValues={initial}
          validationSchema={heroSchema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const res = await fetch("/api/hero", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
              });
              const data = await res.json();
              if (!data.success) throw new Error(data.message);
              toast.success("Hero section updated");
            } catch (err: any) {
              toast.error(err.message || "Update failed");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">
                  Heading
                </label>
                <Field
                  name="heading"
                  className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
                <ErrorMessage
                  name="heading"
                  component="p"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">
                  Description
                </label>
                <RichTextEditor
                  value={values.description}
                  onChange={(html) => setFieldValue("description", html)}
                  placeholder="Hero description..."
                />
                <ErrorMessage
                  name="description"
                  component="p"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">
                    Button Text
                  </label>
                  <Field
                    name="buttonText"
                    className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">
                    Button Link
                  </label>
                  <Field
                    name="buttonLink"
                    className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <ImageUploadField
                label="Banner Image"
                value={values.bannerImage}
                onChange={(url) => setFieldValue("bannerImage", url)}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">
                  Status
                </label>
                <Field
                  as="select"
                  name="status"
                  className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Field>
              </div>

              <Button type="submit" loading={isSubmitting}>
                Save Changes
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
