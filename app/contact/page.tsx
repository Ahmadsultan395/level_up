import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { getSettings } from "@/lib/getSettings";
import ContactForm from "@/components/sections/ContactForm";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
      <div className="mb-12 text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">Contact</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-dark sm:text-4xl">Let&apos;s Start a Conversation</h1>
        <p className="mx-auto mt-3 max-w-xl text-dark-300">Have a project in mind? Fill out the form and we&apos;ll be in touch shortly.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          {settings?.email && (
            <div className="flex items-center gap-4 rounded-2xl border border-dark-100 bg-white p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-700"><Mail size={18} /></div>
              <div>
                <p className="text-xs text-dark-300">Email</p>
                <p className="text-sm font-semibold text-dark">{settings.email}</p>
              </div>
            </div>
          )}
          {settings?.phone && (
            <div className="flex items-center gap-4 rounded-2xl border border-dark-100 bg-white p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-700"><Phone size={18} /></div>
              <div>
                <p className="text-xs text-dark-300">Phone</p>
                <p className="text-sm font-semibold text-dark">{settings.phone}</p>
              </div>
            </div>
          )}
          {settings?.address && (
            <div className="flex items-center gap-4 rounded-2xl border border-dark-100 bg-white p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-700"><MapPin size={18} /></div>
              <div>
                <p className="text-xs text-dark-300">Address</p>
                <p className="text-sm font-semibold text-dark">{settings.address}</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 rounded-2xl border border-dark-100 bg-white p-7">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
