"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Loader, Mail, MessageSquare } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export function NotificationSettings() {
  const { settings, updateNotifications } = useSettings();
  const [formData, setFormData] = useState({
    creationNotifications: {
      email: false,
      sms: false,
    },
    SalesNotifications: {
      email: false,
      sms: false,
    },
    stockNotifications: {
      email: false,
      sms: false,
    },
  });
  const [saved, setSaved] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Initialize with current settings
  useEffect(() => {
    if (settings?.notifications) {
      setFormData(settings.notifications);
    }
  }, [settings?.notifications]);

  const handleSave = async () => {
    try {
      setProcessing(true);
      const success = await updateNotifications(formData);
      if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to update notification settings:", error);
    } finally {
      setProcessing(false);
    }
  };

  const toggleNotification = (
    category: keyof typeof formData,
    channel: "email" | "sms",
  ) => {
    setFormData({
      ...formData,
      [category]: {
        ...formData[category],
        [channel]: !formData[category][channel],
      },
    });
  };

  return (
    <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-teal-100">
          <Bell className="w-5 h-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Creation Notifications */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
            Creation Notifications
          </h3>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.creationNotifications.email}
                onChange={() =>
                  toggleNotification("creationNotifications", "email")
                }
                className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    Email
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Receive email when new items are created
                  </p>
                </div>
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.creationNotifications.sms}
                onChange={() =>
                  toggleNotification("creationNotifications", "sms")
                }
                className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    SMS
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Receive SMS when new items are created
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Sale Notifications */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
            Sale Notifications
          </h3>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.SalesNotifications.email}
                onChange={() =>
                  toggleNotification("SalesNotifications", "email")
                }
                className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    Email
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Receive email when sales are completed
                  </p>
                </div>
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.SalesNotifications.sms}
                onChange={() => toggleNotification("SalesNotifications", "sms")}
                className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    SMS
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Receive SMS when sales are completed
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Stock Notifications */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
            Stock Notifications
          </h3>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.stockNotifications.email}
                onChange={() =>
                  toggleNotification("stockNotifications", "email")
                }
                className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    Email
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Receive email for low stock alerts
                  </p>
                </div>
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.stockNotifications.sms}
                onChange={() => toggleNotification("stockNotifications", "sms")}
                className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    SMS
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Receive SMS for low stock alerts
                  </p>
                </div>
              </div>
            </label>
          </div>
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
          {processing ? (
            <>
              Save Settings.. <Loader className="animate-spin" />
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
