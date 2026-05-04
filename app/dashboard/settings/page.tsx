"use client";

import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { Profile } from "@/components/settings/Profile";
import { Currency } from "@/components/settings/Currency";
import { Users } from "@/components/settings/Users";
import { Security } from "@/components/settings/Security";
import {
  Building2,
  DollarSign,
  Users as UsersIcon,
  Bell,
  Shield,
} from "lucide-react";

export default function SettingsPage() {
  const { settings } = useSettings();
  const { user } = useAuth();

  if (!settings || !user) return null;

  return (
    <div className="space-y-6">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-teal-100">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 mt-1 sm:mt-2">
          Manage your system configuration and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 gap-1 bg-gray-100 dark:bg-slate-700 p-1">
          <TabsTrigger
            value="profile"
            className="text-xs md:text-sm flex items-center gap-1"
          >
            <Building2 className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="currency"
            className="text-xs md:text-sm flex items-center gap-1"
          >
            <DollarSign className="w-4 h-4" />
            Currency
          </TabsTrigger>
          {/* <TabsTrigger
            value="units"
            className="text-xs md:text-sm flex items-center gap-1"
          >
            <Ruler className="w-4 h-4" />
            Units
          </TabsTrigger> */}
          <TabsTrigger
            value="users"
            className="text-xs md:text-sm flex items-center gap-1"
          >
            <UsersIcon className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-xs md:text-sm flex items-center gap-1"
          >
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="text-xs md:text-sm flex items-center gap-1"
          >
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Profile />
        </TabsContent>

        <TabsContent value="currency" className="space-y-4">
          <Currency />
        </TabsContent>

        {/* <TabsContent value="units" className="space-y-4">
          <UnitsSettings settings={settings} onUpdate={updateSettings} />
        </TabsContent> */}

        <TabsContent value="users" className="space-y-4">
          <Users />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Security />
        </TabsContent>
      </Tabs>
    </div>
  );
}
