"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CURRENCIES } from "@/lib/business-config";
import { DollarSign, Loader, RefreshCw, Clock } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";

export function Currency() {
  const {
    settings,
    updateCurrency,
    ratesLoading,
    ratesError,
    lastRateUpdate,
    refreshExchangeRates,
  } = useSettings();
  const [currency, setCurrency] = useState("");
  const [saved, setSaved] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();

  // Initialize with current currency
  useEffect(() => {
    if (settings?.currency?.code) {
      setCurrency(settings.currency.code);
    }
  }, [settings?.currency?.code]);

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency);

  const handleSave = async () => {
    try {
      setProcessing(true);
      const newErrors: Record<string, string> = {};
      if (!currency?.trim()) {
        newErrors.currency = "Currency is required";
      }
      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0 && selectedCurrency) {
        const res = await apiRequest(
          "PUT",
          `/settings/currency/${user?.businessId}`,
          {
            code: currency,
            symbol: selectedCurrency.symbol,
            decimalPlaces: 2,
          },
          user?.token,
        );

        if (res.ok) {
          const success = await updateCurrency({
            code: currency,
            symbol: selectedCurrency.symbol,
            decimalPlaces: 2,
          });
          if (success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
          }
        }
      }
    } catch (error) {
      console.error("Failed to save currency:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRefreshRates = async () => {
    try {
      setRefreshing(true);
      await refreshExchangeRates();
    } catch (error) {
      console.error("Failed to refresh rates:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-teal-100">
            <DollarSign className="w-5 h-5" />
            Currency Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Currency *
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 dark:text-slate-50 ${
                errors.currency
                  ? "border-red-500"
                  : "border-green-200 dark:border-teal-700"
              }`}
            >
              <option value="">-- Select a currency --</option>
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} - {curr.name} ({curr.symbol})
                </option>
              ))}
            </select>
            {errors.currency && (
              <p className="text-red-500 text-xs mt-1">{errors.currency}</p>
            )}
          </div>

          {selectedCurrency && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 dark:bg-blue-900/20 dark:border-blue-700">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Selected:</strong> {selectedCurrency.code} -{" "}
                {selectedCurrency.name} ({selectedCurrency.symbol})
              </p>
            </div>
          )}

          {/* Exchange Rate Status */}
          <div className="border-t pt-4 dark:border-slate-600">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Exchange Rates
              </h3>
              {ratesLoading ? (
                <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                  <Loader className="w-3 h-3 animate-spin" />
                  Loading rates...
                </span>
              ) : lastRateUpdate ? (
                <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated: {lastRateUpdate}
                </span>
              ) : null}
            </div>

            {ratesError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-3 dark:bg-yellow-900/20 dark:border-yellow-700">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  ⚠️ {ratesError}
                </p>
              </div>
            )}

            <Button
              onClick={handleRefreshRates}
              disabled={refreshing || ratesLoading}
              variant="outline"
              size="sm"
              className="w-full dark:border-slate-600 dark:text-slate-300"
            >
              {refreshing || ratesLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Updating Rates...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Exchange Rates
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-700">
          <p className="text-green-700 dark:text-green-300 text-sm">
            ✓ Currency saved successfully
          </p>
        </div>
      )}

      <Button
        onClick={handleSave}
        className="bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700"
      >
        {processing ? (
          <>
            Saving... <Loader className="animate-spin" />
          </>
        ) : (
          "Save Currency"
        )}
      </Button>
    </div>
  );
}
