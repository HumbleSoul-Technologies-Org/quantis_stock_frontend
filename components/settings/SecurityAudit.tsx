"use client";

import { useData } from "@/context/DataContext";
import type {
  SecurityAudit as SecurityAuditType,
  SecurityEventType,
} from "@/lib/types";
import { format } from "date-fns";
import {
  LogIn,
  LogOut,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SecurityEventGroup {
  type: SecurityEventType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const EVENT_GROUPS: Record<string, SecurityEventGroup> = {
  login: {
    type: "login_success",
    label: "Login Events",
    icon: <LogIn className="w-4 h-4" />,
    color: "text-blue-600",
  },
  logout: {
    type: "logout",
    label: "Logout Events",
    icon: <LogOut className="w-4 h-4" />,
    color: "text-gray-600",
  },
  password: {
    type: "password_changed",
    label: "Password Changes",
    icon: <Lock className="w-4 h-4" />,
    color: "text-orange-600",
  },
  profile: {
    type: "profile_updated",
    label: "Profile Updates",
    icon: <User className="w-4 h-4" />,
    color: "text-purple-600",
  },
};

export function SecurityAudit() {
  const { securityAudits } = useData();
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  if (!securityAudits || securityAudits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Audit Log</CardTitle>
          <CardDescription>
            All security events are recorded for your protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-600">No security events recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group audits by event type
  const loginEvents = securityAudits.filter((a) =>
    a.eventType.includes("login"),
  );
  const logoutEvents = securityAudits.filter((a) =>
    a.eventType.includes("logout"),
  );
  const passwordEvents = securityAudits.filter((a) =>
    a.eventType.includes("password"),
  );
  const profileEvents = securityAudits.filter((a) =>
    a.eventType.includes("profile"),
  );

  const renderAuditRow = (audit: SecurityAuditType, index: string) => {
    const isDetailOpen = showDetails[index];
    const isSuccess = audit.status === "success";

    return (
      <div key={index} className="border rounded-lg p-4 mb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium capitalize">
                  {audit.eventType.replace(/_/g, " ")}
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    isSuccess
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {isSuccess ? "Success" : "Failed"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {format(new Date(audit.createdAt || new Date()), "PPp")}
              </p>
              {audit.ipAddress && (
                <p className="text-xs text-gray-500 mt-1">
                  IP: {audit.ipAddress}
                </p>
              )}
              {!isSuccess && audit.reason && (
                <p className="text-sm text-red-600 mt-2">
                  Reason: {audit.reason}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setShowDetails({
                ...showDetails,
                [index]: !isDetailOpen,
              })
            }
          >
            {isDetailOpen ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        </div>

        {isDetailOpen && (
          <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Event Type</p>
                <p className="font-mono text-gray-900">{audit.eventType}</p>
              </div>
              {audit.userAgent && (
                <div>
                  <p className="text-gray-600">User Agent</p>
                  <p className="font-mono text-xs text-gray-700 break-all">
                    {audit.userAgent}
                  </p>
                </div>
              )}
              {audit.resultingAction && (
                <div>
                  <p className="text-gray-600">Action</p>
                  <p className="font-mono text-gray-900">
                    {audit.resultingAction}
                  </p>
                </div>
              )}
              {audit.details && (
                <div className="md:col-span-2">
                  <p className="text-gray-600">Details</p>
                  <pre className="bg-white border border-gray-200 rounded p-2 text-xs overflow-auto max-h-32">
                    {JSON.stringify(audit.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Audit Log</CardTitle>
        <CardDescription>
          All security events are recorded and immutable for your protection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({securityAudits.length})</TabsTrigger>
            <TabsTrigger value="login">
              Login ({loginEvents.length})
            </TabsTrigger>
            <TabsTrigger value="logout">
              Logout ({logoutEvents.length})
            </TabsTrigger>
            <TabsTrigger value="password">
              Password ({passwordEvents.length})
            </TabsTrigger>
            <TabsTrigger value="profile">
              Profile ({profileEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-2">
            {securityAudits.map((audit, index) =>
              renderAuditRow(audit, `all-${index}`),
            )}
          </TabsContent>

          <TabsContent value="login" className="space-y-2">
            {loginEvents.length > 0 ? (
              loginEvents.map((audit, index) =>
                renderAuditRow(audit, `login-${index}`),
              )
            ) : (
              <div className="text-center py-4 text-gray-500">
                No login events recorded
              </div>
            )}
          </TabsContent>

          <TabsContent value="logout" className="space-y-2">
            {logoutEvents.length > 0 ? (
              logoutEvents.map((audit, index) =>
                renderAuditRow(audit, `logout-${index}`),
              )
            ) : (
              <div className="text-center py-4 text-gray-500">
                No logout events recorded
              </div>
            )}
          </TabsContent>

          <TabsContent value="password" className="space-y-2">
            {passwordEvents.length > 0 ? (
              passwordEvents.map((audit, index) =>
                renderAuditRow(audit, `password-${index}`),
              )
            ) : (
              <div className="text-center py-4 text-gray-500">
                No password events recorded
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-2">
            {profileEvents.length > 0 ? (
              profileEvents.map((audit, index) =>
                renderAuditRow(audit, `profile-${index}`),
              )
            ) : (
              <div className="text-center py-4 text-gray-500">
                No profile events recorded
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-900">
            ℹ️ <strong>Important:</strong> This audit log is immutable and
            represents all security-related events on your account. Each event
            is timestamped and includes the IP address and browser information
            for security verification purposes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
