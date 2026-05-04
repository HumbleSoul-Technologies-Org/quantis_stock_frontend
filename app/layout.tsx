import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { BrowserCompatibilityCheck } from "@/components/BrowserCompatibilityCheck";
import { EncryptionErrorBoundary } from "@/components/EncryptionErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quantis stock - Stock Management System",
  description: "Comprehensive inventory and stock management solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Script
          src="https://cdn.jsdelivr.net/npm/qz-tray@2.2.2/qz-tray.js"
          strategy="beforeInteractive"
        />
        <EncryptionErrorBoundary>
          <Providers>
            {children}
            <Toaster />
            <BrowserCompatibilityCheck />
          </Providers>
        </EncryptionErrorBoundary>
      </body>
    </html>
  );
}
