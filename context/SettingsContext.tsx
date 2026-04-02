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
import { apiRequest } from "@/lib/queryClient";

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateBusinessSettings: (settings: Partial<AppSettings>) => Promise<boolean>; // New: update via API
  formatCurrency: (amount: number) => string;
  getCurrencySymbol: () => string;
  getDecimalPlaces: () => number;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

const DEFAULT_SETTINGS: AppSettings = {
  currency: {
    symbol: "$",
    code: "USD",
    decimalPlaces: 2,
  },
  units: {
    weight: "kg",
    volume: "L",
    count: "units",
  },
  notifications: {
    emailAlerts: true,
    smsAlerts: false,
    lowStockAlerts: true,
    saleNotifications: true,
  },
  general: {
    companyName: "My Stock Manager",
    contactEmail: "contact@company.com",
    theme: "light",
  },
  credentials: {
    teamUsers: [],
    passwordPolicy: {
      minLength: 8,
      requireMixedCase: true,
      requireNumbers: true,
      requireSpecialChars: false,
    },
    sessionTimeout: 30,
  },
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const { user, business } = useAuth();

  // Initialize from storage on mount and sync currency from business
  useEffect(() => {
    const storedSettings = storage.getSettings() || DEFAULT_SETTINGS;

    const normalizedSettings: AppSettings = {
      ...DEFAULT_SETTINGS,
      ...storedSettings,
      currency: {
        ...DEFAULT_SETTINGS.currency,
        ...(storedSettings.currency || {}),
      },
      units: {
        ...DEFAULT_SETTINGS.units,
        ...(storedSettings.units || {}),
      },
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(storedSettings.notifications || {}),
      },
      general: {
        ...DEFAULT_SETTINGS.general,
        ...(storedSettings.general || {}),
      },
      credentials: {
        ...DEFAULT_SETTINGS.credentials,
        ...(storedSettings.credentials || {}),
        passwordPolicy: {
          ...DEFAULT_SETTINGS.credentials.passwordPolicy,
          ...(storedSettings.credentials?.passwordPolicy || {}),
        } as Required<AppSettings["credentials"]>["passwordPolicy"],
      },
    };

    if (business?.currency) {
      const currencyObj = CURRENCIES.find((c) => c.code === business.currency);
      if (currencyObj) {
        normalizedSettings.currency = {
          code: currencyObj.code,
          symbol: currencyObj.symbol,
          decimalPlaces: 2,
        };
      }
    }

    setSettings(normalizedSettings);
  }, [business?.currency]);

  const updateSettings = (newSettings: Partial<AppSettings>): void => {
    const merged = {
      ...settings,
      ...newSettings,
      currency: {
        ...settings.currency,
        ...(newSettings.currency || {}),
      },
      units: {
        ...settings.units,
        ...(newSettings.units || {}),
      },
      notifications: {
        ...settings.notifications,
        ...(newSettings.notifications || {}),
      },
      general: {
        ...settings.general,
        ...(newSettings.general || {}),
      },
      credentials: {
        ...settings.credentials,
        ...(newSettings.credentials || {}),
        passwordPolicy: {
          ...settings.credentials.passwordPolicy,
          ...(newSettings.credentials?.passwordPolicy || {}),
        } as Required<AppSettings["credentials"]>["passwordPolicy"],
      },
    };
    setSettings(merged as AppSettings);
    storage.updateSettings(newSettings);
  };

  const updateBusinessSettings = async (
    newSettings: Partial<AppSettings>,
  ): Promise<boolean> => {
    try {
      // Map AppSettings to business update payload
      const businessUpdate = {
        currency: newSettings.currency?.code,
        lowStockThreshold: business?.lowStockThreshold, // Keep existing
        emailAlerts:
          newSettings.notifications?.emailAlerts ?? business?.emailAlerts,
        smsAlerts: newSettings.notifications?.smsAlerts ?? business?.smsAlerts,
        lowStockAlerts:
          newSettings.notifications?.lowStockAlerts ?? business?.lowStockAlerts,
        saleNotifications:
          newSettings.notifications?.saleNotifications ??
          business?.saleNotifications,
      };

      const response = await apiRequest(
        "PUT",
        "/business/setup",
        businessUpdate,
        user?.token,
      );

      if (response.ok) {
        const data = await response.json();
        // Update business in context if returned
        if (data.business) {
          // Note: We'll need to import updateBusiness from AuthContext
          // For now, just update local settings
        }
        // Update local settings
        updateSettings(newSettings);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update business settings:", error);
      return false;
    }
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

  return (
    <SettingsContext.Provider
      value={{
        settings: settings || {
          currency: {
            symbol: "$",
            code: "USD",
            decimalPlaces: 2,
          },
          units: {
            weight: "kg",
            volume: "L",
            count: "units",
          },
          notifications: {
            emailAlerts: true,
            smsAlerts: false,
            lowStockAlerts: true,
            saleNotifications: true,
          },
          general: {
            companyName: "My Stock Manager",
            contactEmail: "contact@company.com",
            theme: "light",
          },
          credentials: {
            teamUsers: [],
            passwordPolicy: {
              minLength: 8,
              requireMixedCase: true,
              requireNumbers: true,
              requireSpecialChars: false,
            },
            sessionTimeout: 30,
          },
        },
        updateSettings,
        updateBusinessSettings, // New: include updateBusinessSettings
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
