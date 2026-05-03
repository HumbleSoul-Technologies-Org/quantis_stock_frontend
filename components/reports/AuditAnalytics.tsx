"use client";

import { useMemo } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  TrendingUp,
  Users,
  FileText,
  Shield,
  ArrowRight,
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface AuditAnalyticsProps {
  onViewFullReport?: () => void;
}

export function AuditAnalytics({ onViewFullReport }: AuditAnalyticsProps) {
  const { activities } = useData();

  // Calculate analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = subDays(now, 7);
    const last30Days = subDays(now, 30);

    const recentActivities = activities.filter(
      (activity) => new Date(activity.createdAt) >= last7Days
    );

    const monthlyActivities = activities.filter(
      (activity) => new Date(activity.createdAt) >= last30Days
    );

    // Activity by type
    const activityByType = activities.reduce((acc, activity) => {
      const type = activity.entityType || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Activity by action
    const activityByAction = activities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top users
    const userActivity = activities.reduce((acc, activity) => {
      const userId = typeof activity.createdBy === "object"
        ? (activity.createdBy as any).id || (activity.createdBy as any)._id
        : activity.createdBy;
      const userName = typeof activity.createdBy === "object"
        ? (activity.createdBy as any).name || (activity.createdBy as any).username || "Unknown"
        : "Unknown";
      acc[userId] = { name: userName, count: (acc[userId]?.count || 0) + 1 };
      return acc;
    }, {} as Record<string, { name: string; count: number }>);

    const topUsers = Object.values(userActivity)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Daily activity trend (last 7 days)
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      const count = activities.filter(
        (activity) =>
          new Date(activity.createdAt) >= dayStart &&
          new Date(activity.createdAt) <= dayEnd
      ).length;
      dailyTrend.push({
        date: format(date, "MMM dd"),
        count,
      });
    }

    return {
      totalActivities: activities.length,
      recentActivities: recentActivities.length,
      monthlyActivities: monthlyActivities.length,
      activityByType,
      activityByAction,
      topUsers,
      dailyTrend,
    };
  }, [activities]);

  // Get action color
  const getActionColor = (action: string) => {
    switch (action) {
      case "create": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "update": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "delete": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "system_event": return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-slate-100">
              Total Activities
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-slate-100">
              {analytics.totalActivities}
            </div>
            <p className="text-xs text-muted-foreground dark:text-slate-400">
              All time audit records
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-slate-100">
              This Week
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-slate-100">
              {analytics.recentActivities}
            </div>
            <p className="text-xs text-muted-foreground dark:text-slate-400">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-slate-100">
              This Month
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-slate-100">
              {analytics.monthlyActivities}
            </div>
            <p className="text-xs text-muted-foreground dark:text-slate-400">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-slate-100">
              Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-slate-100">
              {analytics.topUsers.length}
            </div>
            <p className="text-xs text-muted-foreground dark:text-slate-400">
              Users with activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity by Type */}
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-slate-100">Activity by Resource</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.activityByType)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium dark:text-slate-100 capitalize">
                      {type}
                    </span>
                    <Badge variant="secondary" className="dark:bg-slate-700 dark:text-slate-300">
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity by Action */}
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-slate-100">Activity by Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.activityByAction)
                .sort(([, a], [, b]) => b - a)
                .map(([action, count]) => (
                  <div key={action} className="flex items-center justify-between">
                    <Badge className={getActionColor(action)}>
                      {action}
                    </Badge>
                    <span className="text-sm font-medium dark:text-slate-100">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">Most Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topUsers.map((user, index) => (
              <div key={user.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-sm font-medium dark:text-slate-100">
                    {user.name}
                  </span>
                </div>
                <Badge variant="outline" className="dark:border-slate-600 dark:text-slate-300">
                  {user.count} activities
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Trend */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">Daily Activity Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {analytics.dailyTrend.map((day, index) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary/20 rounded-t min-h-[4px] relative"
                  style={{
                    height: `${Math.max((day.count / Math.max(...analytics.dailyTrend.map(d => d.count))) * 100, 4)}%`,
                  }}
                >
                  <div className="absolute inset-0 bg-primary rounded-t opacity-80"></div>
                </div>
                <span className="text-xs text-muted-foreground dark:text-slate-400">
                  {day.date}
                </span>
                <span className="text-xs font-medium dark:text-slate-100">
                  {day.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Full Report Button */}
      {onViewFullReport && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-medium dark:text-slate-100">Detailed Audit Report</h3>
                  <p className="text-sm text-muted-foreground dark:text-slate-400">
                    View complete audit trail with filtering and export options
                  </p>
                </div>
              </div>
              <Button onClick={onViewFullReport} className="dark:bg-slate-700 dark:hover:bg-slate-600">
                View Report
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}