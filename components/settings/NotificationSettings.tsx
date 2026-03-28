"use client";

import { AppSettings } from "@/lib/types";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";

interface NotificationSettingsProps {
  settings: AppSettings;
  onUpdate: (settings: Partial<AppSettings>) => void;
}

export function NotificationSettings({
  settings,
  onUpdate,
}: NotificationSettingsProps) {
  const [formData, setFormData] = useState(settings.notifications);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();

  const handleSave = async () => {
    try {
      await apiRequest(
        "PUT",
        `/users/${user?.id}/notifications`,
        formData,
        user?.token,
      );
      onUpdate({ notifications: formData });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  };

  const toggleNotification = (key: keyof typeof formData) => {
    setFormData({ ...formData, [key]: !formData[key] });
  };

  return (
    <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-teal-100">
          <Bell className="w-5 h-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
            <input
              type="checkbox"
              checked={formData.emailAlerts}
              onChange={() => toggleNotification("emailAlerts")}
              className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900 dark:text-slate-100">
                Email Alerts
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Receive email notifications for important events
              </p>
            </div>
          </label>

          <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
            <input
              type="checkbox"
              checked={formData.smsAlerts}
              onChange={() => toggleNotification("smsAlerts")}
              className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900 dark:text-slate-100">
                SMS Alerts
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Receive SMS notifications for urgent issues
              </p>
            </div>
          </label>

          <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
            <input
              type="checkbox"
              checked={formData.lowStockAlerts}
              onChange={() => toggleNotification("lowStockAlerts")}
              className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900 dark:text-slate-100">
                Low Stock Alerts
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Get notified when products fall below reorder level
              </p>
            </div>
          </label>

          <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
            <input
              type="checkbox"
              checked={formData.saleNotifications}
              onChange={() => toggleNotification("saleNotifications")}
              className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900 dark:text-slate-100">
                Sale Notifications
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Get notified when new sales are completed
              </p>
            </div>
          </label>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Note:</p>
          <p>
            Notifications help you stay updated on critical business events. SMS
            alerts require additional configuration in your profile.
          </p>
        </div>

        {saved && (
          <p className="text-green-600 dark:text-green-400 text-sm">
            ✓ Notification settings saved successfully
          </p>
        )}

        <Button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700"
        >
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
