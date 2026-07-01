"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BarChart3 } from "lucide-react";
import { useState } from "react";

export type TimePeriod = "daily" | "weekly" | "monthly";

interface TimePeriodControlsProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  className?: string;
}

export function TimePeriodControls({
  selectedPeriod,
  onPeriodChange,
  className = "",
}: TimePeriodControlsProps) {
  const periods = [
    {
      key: "daily" as TimePeriod,
      label: "Daily",
      icon: Clock,
      description: "Last 30 days",
    },
    {
      key: "weekly" as TimePeriod,
      label: "Weekly",
      icon: Calendar,
      description: "Last 12 weeks",
    },
    {
      key: "monthly" as TimePeriod,
      label: "Monthly",
      icon: BarChart3,
      description: "Last 12 months",
    },
  ];

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          View:
        </span>
        {periods.map((period) => {
          const Icon = period.icon;
          return (
            <Button
              key={period.key}
              variant={selectedPeriod === period.key ? "default" : "outline"}
              size="sm"
              onClick={() => onPeriodChange(period.key)}
              className="rounded-full px-4 py-2"
            >
              <Icon className="h-4 w-4" />
              <span>{period.label}</span>
            </Button>
          );
        })}
      </div>
      <Badge
        variant="outline"
        className="text-xs text-slate-500 dark:text-slate-400"
      >
        {periods.find((p) => p.key === selectedPeriod)?.description}
      </Badge>
    </div>
  );
}

// Hook for managing time period state
export function useTimePeriod(initialPeriod: TimePeriod = "monthly") {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(initialPeriod);

  return {
    timePeriod,
    setTimePeriod,
    isDaily: timePeriod === "daily",
    isWeekly: timePeriod === "weekly",
    isMonthly: timePeriod === "monthly",
  };
}

// Utility function to get date range based on period
export function getDateRangeForPeriod(period: TimePeriod) {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case "daily":
      startDate.setDate(now.getDate() - 30); // Last 30 days
      break;
    case "weekly":
      startDate.setDate(now.getDate() - 84); // Last 12 weeks
      break;
    case "monthly":
      startDate.setMonth(now.getMonth() - 12); // Last 12 months
      break;
  }

  return {
    startDate,
    endDate: now,
    period,
  };
}

// Format period labels for charts
export function formatPeriodLabels(period: TimePeriod, dates: Date[]) {
  return dates.map((date) => {
    switch (period) {
      case "daily":
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      case "weekly":
        const weekStart = new Date(date);
        const weekEnd = new Date(date);
        weekEnd.setDate(date.getDate() + 6);
        return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      case "monthly":
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      default:
        return date.toLocaleDateString();
    }
  });
}
