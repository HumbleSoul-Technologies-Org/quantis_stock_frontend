"use client";

import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  CheckCheck,
  Trash2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Wifi,
  Key,
  Package,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { format } from "date-fns";

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSidebar({
  isOpen,
  onClose,
}: NotificationSidebarProps) {
  const {
    notifications,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    getUnreadCount,
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "low_stock":
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case "stock_out":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "new_sale":
        return <ShoppingCart className="w-5 h-5 text-green-600" />;
      case "new_product":
        return <Package className="w-5 h-5 text-blue-600" />;
      case "data_sync":
        return <Zap className="w-5 h-5 text-purple-600" />;
      case "no_internet":
        return <Wifi className="w-5 h-5 text-gray-600" />;
      case "credentials_change":
      case "admin_credentials_updated":
        return <Key className="w-5 h-5 text-orange-600" />;
      case "resource_created":
      case "resource_updated":
      case "resource_deleted":
      case "user_profile_created":
      case "user_profile_updated":
      case "user_profile_deleted":
        return <CheckCircle className="w-5 h-5 text-teal-600" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "low_stock":
        return "bg-amber-50 border-amber-200";
      case "stock_out":
        return "bg-red-50 border-red-200";
      case "new_sale":
        return "bg-green-50 border-green-200";
      case "new_product":
        return "bg-blue-50 border-blue-200";
      case "data_sync":
        return "bg-purple-50 border-purple-200";
      case "no_internet":
        return "bg-gray-50 border-gray-200";
      case "credentials_change":
      case "admin_credentials_updated":
        return "bg-orange-50 border-orange-200";
      case "resource_created":
      case "resource_updated":
      case "resource_deleted":
      case "user_profile_created":
      case "user_profile_updated":
      case "user_profile_deleted":
        return "bg-emerald-50 border-emerald-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const { user } = useAuth();

  if (!isOpen) return null;

  // const filterdNotifications = notifications.filter((n) => {
  //   return !n.readBy?.includes((user?._id as string) || (user?.id as string));
  // });

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-screen w-96 bg-white dark:bg-slate-800 shadow-lg z-50 flex flex-col border-l border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg flex items-center justify-center gap-2 font-bold text-gray-900 dark:text-white">
            Notifications
            {getUnreadCount() > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {getUnreadCount()}
              </span>
            )}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
            <Button
              size="sm"
              variant="outline"
              onClick={markAllAsRead}
              className="text-xs flex-1"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark All Read
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearAll}
              className="text-xs flex-1 text-red-600 border-red-200"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4">
              <AlertCircle className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm text-center">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {notifications.map((notification, index) => (
                <Card
                  key={index} // Fallback to index if id is missing
                  className={`border p-3 cursor-pointer transition-all ${getNotificationColor(
                    notification.type,
                  )} ${notification.readBy?.includes((user?._id as string) || (user?.id as string)) ? "opacity-60" : "opacity-100"}`}
                  onClick={() =>
                    markAsRead(notification.id || notification._id || "")
                  }
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(
                              notification.id || notification._id || "",
                            );
                          }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0 h-auto"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {notification.createdAt
                          ? format(notification.createdAt, "MMM dd, p")
                          : ""}
                      </p>
                      {!notification.read && (
                        <div className="mt-2 w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
