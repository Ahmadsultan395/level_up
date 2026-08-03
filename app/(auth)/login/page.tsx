"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import toast from "react-hot-toast";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/validation/authValidation";
import { SITE_NAME } from "@/utils/constants";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-dark-50/40 px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-dark-100 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-dark">
            <LogIn size={22} />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-dark">{SITE_NAME} Admin</h1>
          <p className="mt-1 text-sm text-dark-300">Sign in to manage your website</p>
        </div>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
              });
              const data = await res.json();
              if (!data.success) throw new Error(data.message);
              toast.success("Welcome back!");
              router.push(searchParams.get("redirect") || "/dashboard");
              router.refresh();
            } catch (err: any) {
              toast.error(err.message || "Login failed");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Email</label>
                <Field name="email" type="email" className="w-full rounded-xl border border-dark-100 px-4 py-3 text-sm focus:border-primary focus:outline-none" placeholder="admin@example.com" />
                <ErrorMessage name="email" component="p" className="mt-1 text-xs text-red-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Password</label>
                <Field name="password" type="password" className="w-full rounded-xl border border-dark-100 px-4 py-3 text-sm focus:border-primary focus:outline-none" placeholder="••••••••" />
                <ErrorMessage name="password" component="p" className="mt-1 text-xs text-red-500" />
              </div>
              <Button type="submit" loading={isSubmitting} className="w-full">
                Sign In
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
