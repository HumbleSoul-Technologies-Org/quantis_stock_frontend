"use client";

import { QuickNav } from "@/components/dashboard/QuickNav";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import {
  RevenueKPICard,
  SalesKPICard,
  LossesKPICard,
  InventoryValueKPICard,
} from "@/components/dashboard/KPICards";
import { SalesTrendChart } from "@/components/dashboard/SalesTrendChart";
import { LossAnalysisChart } from "@/components/dashboard/LossAnalysisChart";
import { ProductPerformanceChart } from "@/components/dashboard/ProductPerformanceChart";
import {
  TimePeriodControls,
  useTimePeriod,
} from "@/components/dashboard/TimePeriodControls";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const { timePeriod, setTimePeriod } = useTimePeriod("monthly");

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

      {(user?.role === "sales" ||
        user?.role === "admin" ||
        user?.role === "manager") && <QuickNav />}

      {/* Global Time Period Controls */}
      <div className="px-2 sm:px-0">
        <TimePeriodControls
          selectedPeriod={timePeriod}
          onPeriodChange={setTimePeriod}
          className="justify-start"
        />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-2 sm:px-0">
        <RevenueKPICard />
        <SalesKPICard />
        <LossesKPICard />
        <InventoryValueKPICard />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 px-2 sm:px-0">
        <SalesTrendChart />
        <LossAnalysisChart />
        <ProductPerformanceChart />
        <RecentActivity />
      </div>
    </div>
  );
}
