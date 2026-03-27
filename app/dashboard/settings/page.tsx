"use client";

import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrencySettings } from "@/components/settings/CurrencySettings";
import { UnitsSettings } from "@/components/settings/UnitsSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { CredentialsSettings } from "@/components/settings/CredentialsSettings";
import { CombinedGeneralSettings } from "@/components/settings/CombinedGeneralSettings";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { user, updateBusinessSetup } = useAuth();

  if (!settings || !user) return null;

  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager";

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

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1 bg-gray-100 dark:bg-slate-700 p-1">
          <TabsTrigger value="general" className="text-xs md:text-sm">
            General
          </TabsTrigger>

          <TabsTrigger value="units" className="text-xs md:text-sm">
            Units
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs md:text-sm">
            Notifications
          </TabsTrigger>
          {(isAdmin || isManager) && (
            <TabsTrigger value="credentials" className="text-xs md:text-sm">
              Credentials
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <CombinedGeneralSettings
            businessSetup={user.businessSetup}
            settings={settings}
            onUpdateBusiness={updateBusinessSetup}
            onUpdateGeneral={updateSettings}
          />
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <UnitsSettings settings={settings} onUpdate={updateSettings} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings settings={settings} onUpdate={updateSettings} />
        </TabsContent>

        {(isAdmin || isManager) && (
          <TabsContent value="credentials" className="space-y-4">
            <CredentialsSettings role={user.role} />
          </TabsContent>
        )}
      </Tabs>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <strong>Note:</strong> All settings are saved automatically. Changes
          to currency and units will be reflected across the entire system.
        </p>
      </div>
    </div>
  );
}
