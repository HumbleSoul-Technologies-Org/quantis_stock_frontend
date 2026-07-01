"use client";

import { useEffect, useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Truck, Package, Zap, AlertCircle } from "lucide-react";
import { format } from "date-fns";

// Activity type to icon mapping
const activityIconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  sale: ShoppingCart,
  stock: Truck,
  product: Package,
  supplier: AlertCircle,
  return: ShoppingCart,
  system: Zap,
  other: AlertCircle,
};

function RecentActivityContent() {
  const { activities } = useData();

  const safeActivities = Array.isArray(activities) ? activities : [];

  const recentActivities = [...safeActivities]
    .filter((activity) => activity?.createdAt)
    .sort((a, b) => {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return Number.isFinite(bDate) && Number.isFinite(aDate)
        ? bDate - aDate
        : 0;
    })
    .slice(0, 10);

  return (
    <Card className="max-h-[30rem] overflow-hidden border border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-700/80 dark:bg-slate-950/85">
      <CardHeader className="p-5 sm:p-6 pb-3">
        <CardTitle className="text-lg sm:text-xl text-slate-900 dark:text-slate-100">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {recentActivities.length === 0 ? (
          <p className="text-sm text-center text-slate-500 dark:text-slate-400">
            No recent activity
          </p>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[25rem] pr-1">
            {recentActivities.map((activity, index) => {
              const Icon = activityIconMap[activity.type] || AlertCircle;
              return (
                <div
                  key={activity.id || activity._id || index}
                  className="flex items-start gap-3 pb-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0"
                >
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl mt-1 shrink-0">
                    <Icon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
                      {activity.title}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 line-clamp-1">
                      {activity.description}
                    </p>
                    <p className="text-slate-500 dark:text-slate-500 text-xs mt-2">
                      {(() => {
                        const dateValue = new Date(activity.createdAt);
                        return Number.isFinite(dateValue.getTime())
                          ? format(dateValue, "MMM d h:mm a")
                          : "Invalid date";
                      })()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RecentActivity() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <RecentActivityContent />;
}
