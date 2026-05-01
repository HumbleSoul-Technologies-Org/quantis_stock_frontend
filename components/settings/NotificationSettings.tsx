"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Loader, Mail, MessageSquare } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export function NotificationSettings() {
  const { settings, updateNotifications } = useSettings();
  const [formData, setFormData] = useState({
    resourceChanges: { email: false, sms: false },
    salesAlert: { email: false, sms: false },
    loginFailAttempts: { email: false, sms: false },
    systemUpdate: { email: false, sms: false },
    returns: { email: false, sms: false },
    lowStock: { email: false, sms: false },
    userProfileChanges: { email: false, sms: false },
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
        {/* Resource Changes Notifications */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
            Alert Resource Changes
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
            Get notified if a resource is created, updated, and deleted
          </p>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.resourceChanges.email}
                onChange={() => toggleNotification("resourceChanges", "email")}
                className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    Email
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Receive email for resource changes
                  </p>
                </div>
              </div>
            </label>
            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.resourceChanges.sms}
                onChange={() => toggleNotification("resourceChanges", "sms")}
                className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    SMS
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Receive SMS for resource changes
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Sales Alert Notifications */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
            Sales Alert
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
            Get notified each time a sale is made
          </p>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.salesAlert.email}
                onChange={() => toggleNotification("salesAlert", "email")}
                className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    Email
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Receive email when sales are made
                  </p>
                </div>
              </div>
            </label>
            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.salesAlert.sms}
                onChange={() => toggleNotification("salesAlert", "sms")}
                className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    SMS
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Receive SMS when sales are made
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Login Fail Attempts */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
            Login Fail Attempts
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
            Get notified when there is a login fail attempt
          </p>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.loginFailAttempts.email}
                onChange={() =>
                  toggleNotification("loginFailAttempts", "email")
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
                    Receive email for failed login attempts
                  </p>
                </div>
              </div>
            </label>
            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.loginFailAttempts.sms}
                onChange={() => toggleNotification("loginFailAttempts", "sms")}
                className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    SMS
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Receive SMS for failed login attempts
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* System Update */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
            System Update
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
            Get notified each time a new system update is released
          </p>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.systemUpdate.email}
                onChange={() => toggleNotification("systemUpdate", "email")}
                className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    Email
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Receive email for system updates
                  </p>
                </div>
              </div>
            </label>
            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.systemUpdate.sms}
                onChange={() => toggleNotification("systemUpdate", "sms")}
                className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    SMS
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Receive SMS for system updates
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Returns */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
            Returns
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
            Get notified when there is a sale return
          </p>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.returns.email}
                onChange={() => toggleNotification("returns", "email")}
                className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    Email
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Receive email for sale returns
                  </p>
                </div>
              </div>
            </label>
            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.returns.sms}
                onChange={() => toggleNotification("returns", "sms")}
                className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    SMS
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Receive SMS for sale returns
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Low Stock */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
            Low Stock
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
            Get notified when a product hits its reorder level
          </p>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.lowStock.email}
                onChange={() => toggleNotification("lowStock", "email")}
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
                checked={formData.lowStock.sms}
                onChange={() => toggleNotification("lowStock", "sms")}
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

        {/* User Profile Changes */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
            User Profile Changes
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
            Get notified when a new user profile is created, updated, banned,
            and deleted
          </p>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.userProfileChanges.email}
                onChange={() =>
                  toggleNotification("userProfileChanges", "email")
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
                    Receive email for user profile changes
                  </p>
                </div>
              </div>
            </label>
            <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.userProfileChanges.sms}
                onChange={() => toggleNotification("userProfileChanges", "sms")}
                className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    SMS
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Receive SMS for user profile changes
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
