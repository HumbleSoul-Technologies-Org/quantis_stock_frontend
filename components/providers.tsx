"use client";

import { ReactNode } from "react";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { DataProvider } from "@/context/DataContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { InactivityTimer } from "@/components/InactivityTimer";
import ThemeProvider from "@/components/theme-provider";
import { useEncryptionStatus } from "@/hooks/useEncryptionStatus";
import { EncryptionStatusMonitor } from "@/components/EncryptionStatusMonitor";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SettingsProvider>
            <InactivityTimer />
            <DataProvider>
              <NotificationProvider>
                {children}
                <EncryptionStatusMonitor />
              </NotificationProvider>
            </DataProvider>
          </SettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
      <SonnerToaster position="bottom-right" richColors closeButton expand />
    </ThemeProvider>
  );
}
