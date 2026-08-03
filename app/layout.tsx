import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/common/Providers";
import { getSettings } from "@/lib/getSettings";
import { SITE_NAME, SITE_URL } from "@/utils/constants";
import AppShell from "@/components/common/AppShell";

const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800"],
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Digital Agency`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "We design, build, and grow digital products — branding, web, marketing and more.",
  openGraph: {
    title: SITE_NAME,
    description: "We design, build, and grow digital products.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body">
        <Providers>
          <AppShell settings={settings}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
