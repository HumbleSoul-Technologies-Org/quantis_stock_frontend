"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { set } from "date-fns";

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
    priority?: NotificationPriority,
    metadata?: Record<string, any>,
  ) => Promise<string>;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const { data: notificationData, refetch } = useQuery<Notification[]>({
    queryKey: ["notifications", "all"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        "/notifications/all",
        {
          userId: user?._id || user?.id, // Support both _id and id
          businessId: user?.business
            ? (user.business as any)._id || (user.business as any).id
            : undefined,
        },
        undefined, // Pass token if needed for auth
      );
      if (!res.ok) {
        throw new Error("Failed to fetch notifications");
      }
      return res.json();
    },
  });

  useEffect(() => {
    if (notificationData) {
      setNotifications(notificationData);
    }
  }, [notificationData]);

  useEffect(() => {}, [user]); // Re-run when user changes to potentially fetch new notifications

  const addNotification = useCallback(
    async (
      type: NotificationType,
      title: string,
      message: string,
      priority: NotificationPriority = "medium",
      metadata?: Record<string, any>,
    ): Promise<string> => {
      const id = Math.random().toString(36).substr(2, 9);
      const payLoad: Notification = {
        type,
        title,
        message,
        priority,
        read: false,
        metadata,
        userId: user?._id || user?.id, // Support both _id and id
        businessId: user?.business
          ? (user.business as any)._id || (user.business as any).id
          : undefined,
      };
      let data = null;

      const res = await apiRequest(
        "POST",
        "/notifications/new",
        {
          userId: user?._id || user?.id, // Support both _id and id
          businessId: user?.business
            ? (user.business as any)._id || (user.business as any).id
            : undefined,
          ...payLoad,
        },
        undefined, // Pass token if needed for auth
      );

      if (res.ok) {
        data = await res.json();
      }

      const newNotification = { ...payLoad, id: data?._id }; // Use returned ID if available

      setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep last 50
      return id;
    },
    [],
  );

  const removeNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await apiRequest(
        "POST",
        `/notifications/${id}/read`,
        {
          userId: user?._id || user?.id, // Support both _id and id
          businessId: user?.business
            ? (user.business as any)._id || (user.business as any).id
            : undefined,
        },
        undefined, // Pass token if needed for auth
      );

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id || n._id === id ? { ...n, read: true } : n,
          ),
        );
      }
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await apiRequest(
        "POST",
        "/notifications/read-all",
        {},
        undefined, // Pass token if needed for auth
      );

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      const res = await apiRequest(
        "DELETE",
        "/notifications/delete-all",
        {},
        undefined, // Pass token if needed for auth
      );

      if (res.ok) {
        setNotifications([]);
      }
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        getUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
