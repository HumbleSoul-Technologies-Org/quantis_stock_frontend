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
    <Card className="mt-4 sm:mt-6 border-green-200 dark:border-teal-700 border-2 bg-white dark:bg-slate-800">
      <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl dark:text-teal-100">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        {recentActivities.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm">
            No recent activity
          </p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activityIconMap[activity.type] || AlertCircle;
              return (
                <div
                  key={activity.id || activity._id || index}
                  className="flex items-start gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-gray-200 dark:border-slate-700 last:border-b-0"
                >
                  <div className="bg-green-100 dark:bg-teal-900 p-1.5 sm:p-2 rounded-lg mt-0.5 sm:mt-1 shrink-0">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-teal-100 text-xs sm:text-sm truncate">
                      {activity.title}
                    </p>
                    <p className="text-gray-600 dark:text-slate-400 text-xs mt-0.5 sm:mt-1 line-clamp-1">
                      {activity.description}
                    </p>
                    <p className="text-gray-500 dark:text-slate-500 text-xs mt-1 sm:mt-2">
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
