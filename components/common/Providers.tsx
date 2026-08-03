"use client";

import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#141414",
            color: "#FFFFFF",
            borderRadius: "12px",
            fontSize: "14px"
          },
          success: { iconTheme: { primary: "#FDB80F", secondary: "#141414" } }
        }}
      />
    </>
  );
}
