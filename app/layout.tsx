import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { BrowserCompatibilityCheck } from "@/components/BrowserCompatibilityCheck";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockOS - Stock Management System",
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
        <Providers>
          {children}
          <Toaster />
          <BrowserCompatibilityCheck />
        </Providers>
      </body>
    </html>
  );
}
