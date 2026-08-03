"use client";

import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/common/RichTextEditor";
import ImageUploadField from "@/components/admin/ImageUploadField";
import Loader from "@/components/common/Loader";
import { settingsSchema } from "@/validation/settingsValidation";

const emptyValues = {
  logo: "",
  phone: "",
  email: "",
  address: "",
  footerText: "",
  socialLinks: {
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    youtube: "",
  },
  aboutStory: "",
  aboutMission: "",
  aboutVision: "",
  whyChooseUs: [] as { title: string; description: string; icon: string }[],
  process: [] as { title: string; description: string }[],
};

export default function SettingsAdminPage() {
  const [initial, setInitial] = useState<typeof emptyValues | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) =>
        setInitial(
          data.success ? { ...emptyValues, ...data.data } : emptyValues,
        ),
      );
  }, []);

  if (!initial) return <Loader fullscreen />;

  return (
    <div>
      <AdminPageHeader
        title="Website Settings"
        description="Global site info, about content, and homepage blocks"
      />

      <div className="w-full space-y-6">
        <Formik
          initialValues={initial}
          validationSchema={settingsSchema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
              });
              const data = await res.json();
              if (!data.success) throw new Error(data.message);
              toast.success("Settings updated");
            } catch (err: any) {
              toast.error(err.message || "Update failed");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className="space-y-8">
              <section className="rounded-2xl border border-dark-100 bg-white p-7">
                <h2 className="mb-5 font-display text-lg font-bold text-dark">
                  General
                </h2>
                <ImageUploadField
                  label="Logo"
                  value={values.logo}
                  onChange={(url) => setFieldValue("logo", url)}
                />
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-dark">
                      Phone
                    </label>
                    <Field
                      name="phone"
                      className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                    <ErrorMessage
                      name="phone"
                      component="p"
                      className="mt-1 text-xs text-red-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-dark">
                      Email
                    </label>
                    <Field
                      name="email"
                      type="email"
                      className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="mt-1 text-xs text-red-500"
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <label className="mb-1.5 block text-sm font-medium text-dark">
                    Address
                  </label>
                  <Field
                    name="address"
                    className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                  <ErrorMessage
                    name="address"
                    component="p"
                    className="mt-1 text-xs text-red-500"
                  />
                </div>
                <div className="mt-5">
                  <label className="mb-1.5 block text-sm font-medium text-dark">
                    Footer Text
                  </label>
                  <Field
                    as="textarea"
                    rows={3}
                    name="footerText"
                    className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-dark-100 bg-white p-7">
                <h2 className="mb-5 font-display text-lg font-bold text-dark">
                  Social Links
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  {(
                    [
                      "facebook",
                      "instagram",
                      "linkedin",
                      "twitter",
                      "youtube",
                    ] as const
                  ).map((key) => (
                    <div key={key}>
                      <label className="mb-1.5 block text-sm font-medium capitalize text-dark">
                        {key}
                      </label>
                      <Field
                        name={`socialLinks.${key}`}
                        className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-dark-100 bg-white p-7">
                <h2 className="mb-5 font-display text-lg font-bold text-dark">
                  About Page
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-dark">
                      Company Story
                    </label>
                    <RichTextEditor
                      value={values.aboutStory}
                      onChange={(html) => setFieldValue("aboutStory", html)}
                      placeholder="Our story..."
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-dark">
                      Mission
                    </label>
                    <RichTextEditor
                      value={values.aboutMission}
                      onChange={(html) => setFieldValue("aboutMission", html)}
                      placeholder="Our mission..."
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-dark">
                      Vision
                    </label>
                    <RichTextEditor
                      value={values.aboutVision}
                      onChange={(html) => setFieldValue("aboutVision", html)}
                      placeholder="Our vision..."
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-dark-100 bg-white p-7">
                <h2 className="mb-5 font-display text-lg font-bold text-dark">
                  Why Choose Us
                </h2>
                <FieldArray name="whyChooseUs">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      {values.whyChooseUs.map((_, i) => (
                        <div
                          key={i}
                          className="grid gap-3 rounded-xl border border-dark-100 p-4 sm:grid-cols-[1fr_2fr_auto]"
                        >
                          <Field
                            name={`whyChooseUs.${i}.title`}
                            placeholder="Title"
                            className="rounded-lg border border-dark-100 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                          />
                          <Field
                            name={`whyChooseUs.${i}.description`}
                            placeholder="Description"
                            className="rounded-lg border border-dark-100 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            className="flex items-center justify-center rounded-lg bg-red-50 px-3 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          push({ title: "", description: "", icon: "" })
                        }
                      >
                        <Plus size={14} /> Add Item
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </section>

              <section className="rounded-2xl border border-dark-100 bg-white p-7">
                <h2 className="mb-5 font-display text-lg font-bold text-dark">
                  Process Steps
                </h2>
                <FieldArray name="process">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      {values.process.map((_, i) => (
                        <div
                          key={i}
                          className="grid gap-3 rounded-xl border border-dark-100 p-4 sm:grid-cols-[1fr_2fr_auto]"
                        >
                          <Field
                            name={`process.${i}.title`}
                            placeholder="Step title"
                            className="rounded-lg border border-dark-100 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                          />
                          <Field
                            name={`process.${i}.description`}
                            placeholder="Step description"
                            className="rounded-lg border border-dark-100 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            className="flex items-center justify-center rounded-lg bg-red-50 px-3 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => push({ title: "", description: "" })}
                      >
                        <Plus size={14} /> Add Step
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </section>

              <Button type="submit" loading={isSubmitting} size="lg">
                Save All Settings
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
