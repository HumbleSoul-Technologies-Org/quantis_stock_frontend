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
import { CategoryDistributionChart } from "@/components/dashboard/CategoryDistributionChart";
import {
  TimePeriodControls,
  useTimePeriod,
} from "@/components/dashboard/TimePeriodControls";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const { timePeriod, setTimePeriod } = useTimePeriod("monthly");

  return (
    <div className="w-full space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] items-end">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-2">
            Welcome to your stock management system
          </p>
        </div>
        <div className="flex items-center justify-end">
          <TimePeriodControls
            selectedPeriod={timePeriod}
            onPeriodChange={setTimePeriod}
            className="justify-end"
          />
        </div>
      </div>

      {(user?.role === "sales" ||
        user?.role === "admin" ||
        user?.role === "manager") && <QuickNav />}

      {/* KPI Cards Grid */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <RevenueKPICard />
        <SalesKPICard />
        <LossesKPICard />
        <InventoryValueKPICard />
      </div>

      {/* Charts Grid */}
      {["admin", "manager", "accountant"].includes(user?.role || "") && (
        <>
          <div className="grid gap-4">
            <SalesTrendChart />
            <div className="grid gap-4 lg:grid-cols-2">
              <LossAnalysisChart />
              <ProductPerformanceChart />
            </div>
            <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
              <CategoryDistributionChart />
              <RecentActivity />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
