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
          businessId: user?.businessId,
        },
        user?.token, // Pass token if needed for auth
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

  const addNotification = useCallback(
    async (
      type: NotificationType,
      title: string,
      message: string,
      priority: NotificationPriority = "medium",
      metadata?: Record<string, any>,
    ): Promise<string> => {
      const id = Math.random().toString(36).substr(2, 9);

      // Guard: ensure user is authenticated with valid token
      if (!user?.token) {
        console.warn("Cannot add notification: user not authenticated");
        return id;
      }

      const payLoad: Notification = {
        type,
        title,
        message,
        priority,
        read: false,
        metadata,
        userId: user?._id || user?.id, // Support both _id and id
        businessId: user?.businessId,
      };
      let data = null;

      const res = await apiRequest(
        "POST",
        "/notifications/new",
        {
          userId: user?._id || user?.id, // Support both _id and id
          businessId: user?.businessId,
          ...payLoad,
        },
        user?.token, // Pass token if needed for auth
      );

      if (res.ok) {
        data = await res.json();
      }

      const newNotification = { ...payLoad, id: data?._id }; // Use returned ID if available

      setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep last 50
      return id;
    },
    [user?.token, user?._id, user?.id, user?.businessId],
  );

  const removeNotification = useCallback(
    async (id: string) => {
      try {
        if (!user?.token) {
          console.warn("Cannot remove notification: user not authenticated");
          return;
        }
        const res = await apiRequest(
          "DELETE",
          `/notifications/${id}/delete`,
          {
            businessId: user?.businessId,
          },
          user?.token, // Pass token if needed for auth
        );
        if (res.ok) {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== id || n._id !== id),
          );
        }
      } catch (error) {
        console.log("====================================");
        console.log(error);
        console.log("====================================");
      }
    },
    [user?.token, user?.businessId],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        if (!user?.token) {
          console.warn(
            "Cannot mark notification as read: user not authenticated",
          );
          return;
        }
        const credentails = {
          userId: user?._id || user?.id, // Support both _id and id
          businessId: user?.businessId,
        };
        const res = await apiRequest(
          "POST",
          `/notifications/${id}/read`,
          credentails,
          user?.token, // Pass token if needed for auth
        );

        if (res.ok) {
          setNotifications((prev) =>
            prev.map((n: any) =>
              n.id === id || n._id === id
                ? { ...n, readBy: [...n?.readBy, user?._id] }
                : n,
            ),
          );
        }
      } catch (error) {
        console.log("====================================");
        console.log(error);
        console.log("====================================");
      }
    },
    [user?.token, user?._id, user?.id, user?.businessId],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await apiRequest(
        "POST",
        "/notifications/read-all",
        {},
        undefined, // Pass token if needed for auth
      );

      if (res.ok) {
        refetch(); // Refetch to get updated read status
      }
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      if (!user?.token) {
        console.warn("Cannot clear notifications: user not authenticated");
        return;
      }
      user?.businessId;
      const res = await apiRequest(
        "DELETE",
        `/notifications/clear/${user?.businessId}`,
        {},
        user?.token, // Pass token if needed for auth
      );

      if (res.ok) {
        setNotifications([]);
      }
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  }, [user?.token, user?.businessId]);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(
      (n: any) => (n.readBy || []).includes(user?._id || user?.id) === false,
    ).length;
  }, [notifications, user]);

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
