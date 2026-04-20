"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export function SyncData() {
  const { settings, updateSyncData } = useSettings();
  const [offlineMode, setOfflineMode] = useState(false);
  const [syncInterval, setSyncInterval] = useState("15");
  const [saved, setSaved] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Initialize with current settings
  useEffect(() => {
    if (settings?.syncData) {
      setOfflineMode(settings.syncData.offlineMode);
      setSyncInterval(settings.syncData.syncInterval);
    }
  }, [settings?.syncData]);

  const handleSave = async () => {
    try {
      setProcessing(true);
      const success = await updateSyncData({
        offlineMode,
        syncInterval,
        lastSyncedAt: new Date().toISOString(),
      });

      if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save sync settings:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-teal-100">
            <RefreshCw className="w-5 h-5" />
            Data Synchronization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Offline Working</Label>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Allow the app to work offline and sync data when online
              </p>
            </div>
            <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-teal-700">
            <Label className="text-base">Sync Interval (minutes)</Label>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
              How often to sync data when online
            </p>
            <select
              value={syncInterval}
              onChange={(e) => setSyncInterval(e.target.value)}
              className="w-full px-3 py-2 border border-green-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 dark:text-slate-50 dark:border-teal-700"
            >
              <option value="5">5 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 dark:bg-blue-900/20 dark:border-blue-700">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> When offline, changes are stored locally
              and synced automatically when connection is restored.
            </p>
          </div>
        </CardContent>
      </Card>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-700">
          <p className="text-green-700 dark:text-green-300 text-sm">
            ✓ Sync settings saved successfully
          </p>
        </div>
      )}

      <Button
        onClick={handleSave}
        className="bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700"
      >
        {processing ? (
          <>
            Saving Settings.. <Loader className="animate-spin" />
          </>
        ) : (
          "Save Sync Settings"
        )}
      </Button>
    </div>
  );
}
