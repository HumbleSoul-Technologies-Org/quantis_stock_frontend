'use client';

import { AppSettings } from '@/lib/types';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface NotificationSettingsProps {
  settings: AppSettings;
  onUpdate: (settings: Partial<AppSettings>) => void;
}

export function NotificationSettings({ settings, onUpdate }: NotificationSettingsProps) {
  const [formData, setFormData] = useState(settings.notifications);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdate({ notifications: formData });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleNotification = (key: keyof typeof formData) => {
    setFormData({ ...formData, [key]: !formData[key] });
  };

  return (
    <Card className="border-green-200 border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.emailAlerts}
              onChange={() => toggleNotification('emailAlerts')}
              className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900">Email Alerts</p>
              <p className="text-sm text-gray-600">Receive email notifications for important events</p>
            </div>
          </label>

          <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.smsAlerts}
              onChange={() => toggleNotification('smsAlerts')}
              className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900">SMS Alerts</p>
              <p className="text-sm text-gray-600">Receive SMS notifications for urgent issues</p>
            </div>
          </label>

          <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.lowStockAlerts}
              onChange={() => toggleNotification('lowStockAlerts')}
              className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900">Low Stock Alerts</p>
              <p className="text-sm text-gray-600">Get notified when products fall below reorder level</p>
            </div>
          </label>

          <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.saleNotifications}
              onChange={() => toggleNotification('saleNotifications')}
              className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900">Sale Notifications</p>
              <p className="text-sm text-gray-600">Get notified when new sales are completed</p>
            </div>
          </label>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          <p className="font-medium mb-1">Note:</p>
          <p>Notifications help you stay updated on critical business events. SMS alerts require additional configuration in your profile.</p>
        </div>

        {saved && <p className="text-green-600 text-sm">✓ Notification settings saved successfully</p>}

        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
