"use client";

import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickNav } from "@/components/dashboard/QuickNav";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-teal-100">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 mt-1 sm:mt-2">
          Welcome to your stock management system
        </p>
      </div>

      {user && user.role === "sales" && <QuickNav />}
      <OverviewCards />
      <RecentActivity />
    </div>
  );
}
