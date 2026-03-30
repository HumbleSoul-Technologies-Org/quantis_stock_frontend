"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Truck,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  {
    href: "/dashboard/products",
    label: "+ Add Product",
    icon: Package,
    roles: ["admin", "manager"],
  },
  {
    href: "/dashboard/inventory",
    label: "+ Stock In",
    icon: Truck,
    roles: ["admin", "manager"],
  },
  {
    href: "/dashboard/sales",
    label: "+ Add Sale",
    icon: ShoppingCart,
    roles: ["admin", "manager", "sales"],
  },
  {
    href: "/dashboard/suppliers",
    label: "+ Add Supplier",
    icon: Users,
    roles: ["admin", "manager"],
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    icon: BarChart3,
    roles: ["admin", "manager"],
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    roles: ["admin", "manager"],
  },
  {
    href: "/dashboard/help",
    label: "Help",
    icon: HelpCircle,
    roles: ["admin", "manager", "sales"],
  },
];

function QuickNavContent() {
  const { user } = useAuth();

  if (!user) return null;

  const visibleItems = navItems.filter((item) =>
    item.roles.includes(user.role),
  );

  return (
    <Card className="mb-4 sm:mb-6 bg-gradient-to-r from-green-50 dark:from-teal-900 to-emerald-50 dark:to-slate-800 border-green-200 dark:border-teal-700">
      <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
        <CardTitle className="text-green-800 dark:text-teal-300 text-lg sm:text-xl">
          Quick Navigation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-2 sm:pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg bg-white dark:bg-slate-700 hover:bg-green-100 dark:hover:bg-teal-800 border border-green-200 dark:border-teal-600 transition-colors"
              >
                <Icon className="w-4 sm:w-5 h-4 sm:h-5 text-green-700 dark:text-teal-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-teal-100 text-center">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickNav() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <QuickNavContent />;
}
