"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AppSettings } from "@/lib/types";
import { storage } from "@/lib/storage";
import { CURRENCIES } from "@/lib/business-config";
import { useAuth } from "@/context/AuthContext";

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  formatCurrency: (amount: number) => string;
  getCurrencySymbol: () => string;
  getDecimalPlaces: () => number;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const { user } = useAuth();

  // Initialize from storage on mount and sync currency from user's businessSetup
  useEffect(() => {
    const storedSettings = storage.getSettings();

    // If user has businessSetup with currency, derive currency settings from it
    if (user?.businessSetup?.currency) {
      const currencyObj = CURRENCIES.find(
        (c) => c.code === user.businessSetup!.currency,
      );
      if (currencyObj) {
        storedSettings.currency = {
          code: currencyObj.code,
          symbol: currencyObj.symbol,
          decimalPlaces: 2,
        };
      }
    }

    setSettings(storedSettings);
  }, [user?.businessSetup?.currency]);

  const updateSettings = (newSettings: Partial<AppSettings>): void => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated as AppSettings);
    storage.updateSettings(newSettings);
  };

  const formatCurrency = (amount: number): string => {
    if (!settings) return amount.toString();
    const { currency } = settings;
    const formatted = amount.toFixed(currency.decimalPlaces);
    return `${currency.symbol} ${formatted}`;
  };

  const getCurrencySymbol = (): string => {
    return settings?.currency?.symbol || "USh";
  };

  const getDecimalPlaces = (): number => {
    return settings?.currency?.decimalPlaces || 2;
  };

  if (!settings) {
    return <>{children}</>;
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        formatCurrency,
        getCurrencySymbol,
        getDecimalPlaces,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
