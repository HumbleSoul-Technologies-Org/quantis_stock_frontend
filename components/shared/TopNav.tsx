"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun, Bell, Wifi } from "lucide-react";
import { useState, useEffect } from "react";
import { NotificationSidebar } from "@/components/notifications/NotificationSidebar";
import { TrialWarningDialog } from "@/components/TrialWarningDialog";
import { useTrialStatus } from "@/hooks/useTrialStatus";

export function TopNav() {
  const { user, business, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { getUnreadCount } = useNotifications();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showTrialDialog, setShowTrialDialog] = useState(false);
  const [hasAutoShownTrialDialog, setHasAutoShownTrialDialog] = useState(false);
  const trialStatus = useTrialStatus(user?.trial_expires);

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

  useEffect(() => {
    if (!user) return;
    if (!trialStatus.isActive || trialStatus.daysLeft > 5) return;

    const sessionKey = "trialWarningDialogShown";
    const alreadyShown = sessionStorage.getItem(sessionKey) === "true";

    if (!alreadyShown) {
      setShowTrialDialog(true);
      sessionStorage.setItem(sessionKey, "true");
      setHasAutoShownTrialDialog(true);
    }
  }, [trialStatus.daysLeft, trialStatus.isActive, user]);

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

  const handleLogout = async () => {
    await logout();
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
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
              <Wifi className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline">Connected</span>
            </span>
            {!business?.activated &&
            user?.trial_expires &&
            trialStatus.isActive ? (
              <button
                type="button"
                onClick={() => setShowTrialDialog((open) => !open)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                  trialStatus.statusColor === "green"
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                    : trialStatus.statusColor === "amber"
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                      : trialStatus.statusColor === "red"
                        ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
                        : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800"
                }`}
                title="View trial status"
              >
                <span className="hidden sm:inline">Trial:</span>{" "}
                {trialStatus.statusText}
              </button>
            ) : null}
            <TrialWarningDialog
              isOpen={showTrialDialog}
              onClose={() => setShowTrialDialog(false)}
              daysLeft={trialStatus.daysLeft}
              userId={user?.id}
            />
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
    </>
  );
}
