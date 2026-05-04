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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, AlertTriangle, Package } from "lucide-react";

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
      </div>

      {/* Additional Analytics Section */}
      {(user?.role === "admin" || user?.role === "manager") && (
        <div className="px-2 sm:px-0">
          <Card className="dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Advanced Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold">+12.5%</div>
                  <div className="text-sm text-muted-foreground">
                    Growth Rate
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Package className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold">98.2%</div>
                  <div className="text-sm text-muted-foreground">
                    Stock Accuracy
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <AlertTriangle className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <div className="text-2xl font-bold">2.1%</div>
                  <div className="text-sm text-muted-foreground">Loss Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <BarChart3 className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="text-2xl font-bold">4.8</div>
                  <div className="text-sm text-muted-foreground">
                    Avg Order Value
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <RecentActivity />
    </div>
  );
}
