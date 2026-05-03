"use client";

import { useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { Activity, ActivityAction, ActivityStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  Shield,
  Calendar,
  User,
  Activity as ActivityIcon,
  FileText,
  FileJson,
} from "lucide-react";
import { format } from "date-fns";
import {
  exportActivitiesToCSV,
  exportActivitiesToJSON,
  ExportOptions,
} from "@/lib/exportUtils";

interface AuditReportProps {}

export function AuditReport({}: AuditReportProps) {
  const { activities } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  // Get unique users for filter dropdown
  const uniqueUsers = useMemo(() => {
    const userMap = new Map();
    activities.forEach((activity) => {
      if (activity.createdBy && typeof activity.createdBy === "object") {
        const user = activity.createdBy as any;
        userMap.set(user.id || user._id, user.name || user.username || "Unknown");
      }
    });
    return Array.from(userMap.entries()).map(([id, name]) => ({ id, name }));
  }, [activities]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          activity.title.toLowerCase().includes(searchLower) ||
          activity.description.toLowerCase().includes(searchLower) ||
          activity.referenceId?.toLowerCase().includes(searchLower) ||
          activity.entityId?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Date range filter
      if (dateFrom || dateTo) {
        const activityDate = new Date(activity.createdAt);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          if (activityDate < fromDate) return false;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999); // End of day
          if (activityDate > toDate) return false;
        }
      }

      // Resource type filter
      if (resourceFilter !== "all" && activity.entityType !== resourceFilter) {
        return false;
      }

      // Action filter
      if (actionFilter !== "all" && activity.action !== actionFilter) {
        return false;
      }

      // User filter
      if (userFilter !== "all") {
        const activityUserId =
          typeof activity.createdBy === "object"
            ? (activity.createdBy as any).id || (activity.createdBy as any)._id
            : activity.createdBy;
        if (activityUserId !== userFilter) return false;
      }

      // Status filter
      if (statusFilter !== "all" && activity.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [activities, searchTerm, dateFrom, dateTo, resourceFilter, actionFilter, userFilter, statusFilter]);

  // Get user name for display
  const getUserName = (createdBy: string | any) => {
    if (typeof createdBy === "string") return "Unknown";
    return createdBy?.name || createdBy?.username || "Unknown";
  };

  // Get action color
  const getActionColor = (action: ActivityAction) => {
    switch (action) {
      case "create": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "update": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "delete": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "system_event": return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  // Get status color
  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "failed": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  // Render change diff
  const renderChangeDiff = (changeLog?: any) => {
    if (!changeLog || !changeLog.changedFields?.length) {
      return <span className="text-gray-500">No changes recorded</span>;
    }

    return (
      <div className="space-y-1">
        {changeLog.changedFields.map((field: string) => (
          <div key={field} className="text-xs">
            <span className="font-medium">{field}:</span>{" "}
            <span className="text-red-600 line-through">
              {changeLog.before?.[field] || "null"}
            </span>{" "}
            →{" "}
            <span className="text-green-600">
              {changeLog.after?.[field] || "null"}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Export to CSV
  const exportToCSV = () => {
    const options: ExportOptions = {
      filename: `audit-report-${format(new Date(), "yyyy-MM-dd")}.csv`,
      includeHeaders: true,
      dateFormat: "yyyy-MM-dd HH:mm:ss",
    };
    exportActivitiesToCSV(filteredActivities, options);
  };

  // Export to JSON
  const exportToJSON = () => {
    const options: ExportOptions = {
      filename: `audit-report-${format(new Date(), "yyyy-MM-dd")}.json`,
    };
    exportActivitiesToJSON(filteredActivities, options);
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-slate-100">
            <Shield className="w-5 h-5" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 dark:bg-slate-800 dark:border-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                Date From
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="dark:bg-slate-800 dark:border-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                Date To
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="dark:bg-slate-800 dark:border-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                Resource Type
              </label>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="product">Products</SelectItem>
                  <SelectItem value="sale">Sales</SelectItem>
                  <SelectItem value="stockMovement">Inventory</SelectItem>
                  <SelectItem value="supplier">Suppliers</SelectItem>
                  <SelectItem value="return">Returns</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                Action
              </label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="system_event">System Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                User
              </label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={exportToCSV} className="dark:bg-slate-700 dark:hover:bg-slate-600 gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button onClick={exportToJSON} variant="outline" className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 gap-2">
                <FileJson className="w-4 h-4" />
                Export JSON
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Showing {filteredActivities.length} of {activities.length} activities
              </p>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="text-center py-8">
                <ActivityIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-slate-400">
                  No activities found matching your filters.
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden dark:border-slate-700">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:bg-slate-800">
                      <TableHead className="dark:text-slate-300">Action</TableHead>
                      <TableHead className="dark:text-slate-300">Resource</TableHead>
                      <TableHead className="dark:text-slate-300">Entity</TableHead>
                      <TableHead className="dark:text-slate-300">User</TableHead>
                      <TableHead className="dark:text-slate-300">Date</TableHead>
                      <TableHead className="dark:text-slate-300">Status</TableHead>
                      <TableHead className="dark:text-slate-300">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.map((activity) => (
                      <TableRow key={activity.id} className="dark:bg-slate-900 dark:border-slate-700">
                        <TableCell>
                          <Badge className={getActionColor(activity.action)}>
                            {activity.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="dark:text-slate-100">
                          {activity.entityType || "Unknown"}
                        </TableCell>
                        <TableCell className="dark:text-slate-100">
                          {activity.referenceId || activity.entityId || "N/A"}
                        </TableCell>
                        <TableCell className="dark:text-slate-100">
                          {getUserName(activity.createdBy)}
                        </TableCell>
                        <TableCell className="dark:text-slate-100">
                          {format(new Date(activity.createdAt), "MMM dd, HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpandedActivity(
                                expandedActivity === activity.id ? null : activity.id
                              )
                            }
                            className="dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            {expandedActivity === activity.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Expanded Details */}
                {expandedActivity && (
                  <div className="border-t dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-800">
                    {(() => {
                      const activity = filteredActivities.find(a => a.id === expandedActivity);
                      if (!activity) return null;

                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2 dark:text-slate-100">Activity Details</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Title:</span> {activity.title}</p>
                                <p><span className="font-medium">Description:</span> {activity.description}</p>
                                <p><span className="font-medium">IP Address:</span> {activity.ipAddress || "N/A"}</p>
                                <p><span className="font-medium">User Agent:</span> {activity.userAgent ? "Present" : "N/A"}</p>
                                {activity.resultingAction && (
                                  <p><span className="font-medium">Result:</span> {activity.resultingAction}</p>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2 dark:text-slate-100">Changes</h4>
                              {renderChangeDiff(activity.changeLog)}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Immutability Notice */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Audit Trail Security
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Audit logs are immutable and represent a permanent record of all system changes.
                  These records cannot be modified or deleted through the user interface.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}