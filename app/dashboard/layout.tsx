"use client";

import { Sidebar } from "@/components/shared/Sidebar";
import { TopNav } from "@/components/shared/TopNav";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SyncModal } from "@/components/SyncModal";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, business, isLoading } = useAuth();
  const router = useRouter();
  const { showSyncModal, setShowSyncModal } = useOfflineSync();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role === "admin" && !business) {
      router.push("/onboarding");
      return;
    }

    // Only redirect to dashboard if not already there to avoid redirect loops
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/dashboard")
    ) {
      router.push("/dashboard");
    }
  }, [user, business, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 dark:border-teal-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-teal-200">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900">
          <div className="p-3 sm:p-6">
            <Breadcrumb />
            {children}
          </div>
        </main>
      </div>
      <SyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
      />
    </div>
  );
}
