"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Truck,
  ShoppingCart,
  BarChart3,
  Users,
  UserPlus,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  MapPin,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const { user, business, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!user) return null;

  const menuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "manager", "accountant", "sales"],
    },
    {
      href: "/dashboard/products",
      label: "Products",
      icon: Package,
      roles: ["admin", "manager", "accountant", "sales"],
    },
    {
      href: "/dashboard/stock",
      label: "Stock",
      icon: Truck,
      roles: ["admin", "manager", "accountant"],
    },
    {
      href: "/dashboard/sales",
      label: "Sales",
      icon: ShoppingCart,
      roles: ["admin", "manager", "sales", "accountant"],
    },
    {
      href: "/dashboard/customers",
      label: "Customers",
      icon: UserPlus,
      roles: ["admin", "manager", "accountant", "sales"],
    },
    {
      href: "/dashboard/suppliers",
      label: "Suppliers",
      icon: Users,
      roles: ["admin", "manager", "accountant"],
    },
    {
      href: "/dashboard/reports",
      label: "Reports",
      icon: BarChart3,
      roles: ["admin", "manager", "accountant"],
    },
    {
      href: "/dashboard/branches",
      label: "Branches",
      icon: MapPin,
      roles: ["admin", "manager", "accountant"],
    },
    {
      href: "/subscriptions",
      label: "Subscriptions",
      icon: CreditCard,
      roles: ["admin", "manager", "accountant", "sales"],
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      roles: ["admin"],
    },
    {
      href: "/dashboard/help",
      label: "Help & Support",
      icon: HelpCircle,
      roles: ["admin", "manager", "sales", "accountant"],
    },
  ];

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(user.role),
  );

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <>
      {/* Mobile Menu Button - appears on small screens */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-white dark:bg-slate-800 border-b border-green-200 dark:border-teal-700 p-2 flex items-center justify-between">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 hover:bg-green-100 dark:hover:bg-teal-800 rounded-lg"
        >
          {isMobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
        <div>
          <h1 className="text-lg font-bold text-green-700 dark:text-green-300">
            Quantis stock
          </h1>
        </div>
        <div className="w-10" />
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative w-64 bg-linear-to-b from-green-50 to-white dark:from-slate-800 dark:to-slate-900 border-r border-green-200 dark:border-teal-700 h-screen overflow-y-auto transition-transform duration-300 z-40 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 lg:p-6 mt-14 lg:mt-0">
          <h1 className="text-2xl font-bold text-green-700 dark:text-green-300">
            {business ? business?.businessName : "Quantis stock"}
          </h1>
          <p className="text-sm text-green-600 dark:text-teal-400 mt-1">
            Stock Management
          </p>
        </div>

        <nav className="px-4 py-6 space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const effectivePlan =
              business?.currentPlan || business?.businessType;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
              >
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left ${
                    isActive
                      ? "bg-teal-700 dark:bg-teal-700 text-white dark:text-white font-semibold"
                      : "hover:bg-green-100 dark:hover:bg-teal-800 hover:text-green-700 dark:hover:text-teal-300 text-gray-700 dark:text-gray-300"
                  }  ${effectivePlan === "retail" && item.label === "Customers" ? "hidden" : ""}`}
                >
                  <Icon className="w-5 h-5 mr-3 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-teal-700 dark:border-teal-700 bg-green-50 dark:bg-slate-800">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            <p className="font-semibold text-gray-700 dark:text-teal-300">
              Logged in as
            </p>
            <p className="text-green-700 dark:text-teal-400 truncate">
              {user.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">
              {user.role}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            className="w-full lg:hidden   justify-start text-left bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
          >
            <LogOut className="w-5 h-5 mr-3 shrink-0" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
