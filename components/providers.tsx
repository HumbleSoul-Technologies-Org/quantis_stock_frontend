"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { DataProvider } from "@/context/DataContext";
import { NotificationProvider } from "@/context/NotificationContext";
import ThemeProvider from "@/components/theme-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SettingsProvider>
            <DataProvider>
              <NotificationProvider>{children}</NotificationProvider>
            </DataProvider>
          </SettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme="light"
        expand={true}
      />
    </ThemeProvider>
  );
}
