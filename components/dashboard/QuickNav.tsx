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
    roles: ["admin", "manager", "sales", "accountant"],
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
    <Card className="mb-4 sm:mb-6 border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-950/90 dark:shadow-lg dark:shadow-slate-950/20">
      <CardHeader className="p-5 sm:p-6 pb-3">
        <CardTitle className="text-slate-900 dark:text-slate-100 text-lg sm:text-xl">
          Quick Navigation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-2 rounded-[1.75rem] border border-slate-200/70 bg-white/95 dark:border-slate-700/70 dark:bg-slate-900/80 p-3 text-center transition hover:border-slate-300 hover:bg-white/97 dark:hover:border-slate-500 dark:hover:bg-slate-900/95"
              >
                <Icon className="w-5 h-5 text-slate-900 dark:text-slate-200" />
                <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
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
