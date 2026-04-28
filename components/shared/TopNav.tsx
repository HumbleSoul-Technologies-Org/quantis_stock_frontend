"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Moon,
  Sun,
  Bell,
  Wifi,
  WifiOff,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NotificationSidebar } from "@/components/notifications/NotificationSidebar";
import { SyncModal } from "@/components/SyncModal";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export function TopNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { getUnreadCount } = useNotifications();
  const { isOnline, pendingActions } = useOfflineSync(undefined, user?.token);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const getPageTitle = () => {
    const path = pathname.replace("/dashboard/", "").split("/")[0];
    const titles: Record<string, string> = {
      "": "Dashboard",
      products: "Products",
      inventory: "Inventory",
      sales: "Sales",
      suppliers: "Suppliers",
      reports: "Reports",
      settings: "Settings",
      help: "Help & Support",
    };
    return titles[path] || "Dashboard";
  };

  useEffect(() => {
    const storedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(storedTheme);
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    // Update unread count
    setUnreadCount(getUnreadCount());
  }, [getUnreadCount]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  if (!user) return null;

  return (
    <>
      <header className="bg-white dark:bg-slate-800 border-b border-green-200 dark:border-teal-700 shadow-sm sticky top-0 z-40">
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-teal-100">
              {getPageTitle()}
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Connection Indicator Badge */}
            <button
              onClick={() => setShowSyncModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                isOnline
                  ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              } hover:shadow-md cursor-pointer`}
              title={`${isOnline ? "Connected" : "Disconnected"}${pendingActions.length > 0 ? ` • ${pendingActions.length} pending` : ""}`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 animate-pulse" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
              {pendingActions.length > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded text-xs font-bold ${
                    isOnline
                      ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200"
                      : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"
                  }`}
                >
                  {pendingActions.length}
                </span>
              )}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-gray-600 dark:text-teal-400 hover:text-green-700 dark:hover:text-teal-300"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-teal-400 hover:text-green-700 dark:hover:text-teal-300"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300 text-xs sm:text-sm"
            >
              <LogOut className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <NotificationSidebar
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <SyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
      />
    </>
  );
}
