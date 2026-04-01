"use client";

import { AppSettings } from "@/lib/types";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";

interface GeneralSettingsProps {
  settings: AppSettings;
  onUpdate: (settings: Partial<AppSettings>) => void;
}

export function GeneralSettings({ settings, onUpdate }: GeneralSettingsProps) {
  const [formData, setFormData] = useState(settings.general);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();

  const handleSave = async () => {
    try {
      // await apiRequest(
      //   "PUT",
      //   `/users/${user?.id}/business-setup`,
      //   formData,
      //   user?.token,
      // );
      // onUpdate({ general: formData });
      // setSaved(true);
      // setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save general settings:", error);
    }
  };

  return (
    <Card className="border-green-200 border-2">
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <Input
            value={formData.companyName}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
            placeholder="My Stock Manager"
            className="border-green-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email
          </label>
          <Input
            type="email"
            value={formData.contactEmail}
            onChange={(e) =>
              setFormData({ ...formData, contactEmail: e.target.value })
            }
            placeholder="contact@company.com"
            className="border-green-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Theme
          </label>
          <select
            value={formData.theme}
            onChange={(e) =>
              setFormData({
                ...formData,
                theme: e.target.value as "light" | "dark",
              })
            }
            className="w-full px-3 py-2 border border-green-200 rounded-md text-sm"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {saved && (
          <p className="text-green-600 text-sm">
            ✓ Settings saved successfully
          </p>
        )}

        <Button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700"
        >
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
