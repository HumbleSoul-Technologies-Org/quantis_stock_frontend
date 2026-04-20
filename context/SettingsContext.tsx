"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { BusinessSettings } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";

interface SettingsContextType {
  settings: BusinessSettings | null;
  isLoading: boolean;
  updateCurrency: (currency: BusinessSettings["currency"]) => Promise<boolean>;
  updateNotifications: (
    notifications: BusinessSettings["notifications"],
  ) => Promise<boolean>;
  updateSyncData: (syncData: BusinessSettings["syncData"]) => Promise<boolean>;
  updateUnits: (units: BusinessSettings["units"]) => Promise<boolean>;
  formatCurrency: (amount: number) => string;
  getCurrencySymbol: () => string;
  getDecimalPlaces: () => number;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

const DEFAULT_CURRENCY = {
  code: "USD",
  symbol: "$",
  decimalPlaces: 2,
};

const DEFAULT_UNITS = {
  weightUnits: ["kg", "lbs", "oz"],
  volumeUnits: ["L", "ml", "gallons"],
  lengthUnits: ["m", "cm", "mm", "ft", "in"],
  countUnits: ["units", "boxes", "pieces"],
};

const DEFAULT_SYNC_DATA = {
  offlineMode: false,
  syncInterval: "15",
  lastSyncedAt: undefined,
};

const DEFAULT_NOTIFICATIONS = {
  creationNotifications: { email: false, sms: false },
  SalesNotifications: { email: false, sms: false },
  stockNotifications: { email: false, sms: false },
};

const DEFAULT_SETTINGS: BusinessSettings = {
  businessId: "",
  currency: DEFAULT_CURRENCY,
  units: DEFAULT_UNITS,
  syncData: DEFAULT_SYNC_DATA,
  notifications: DEFAULT_NOTIFICATIONS,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, business, updateBusiness } = useAuth();

  // Initialize settings from business data or localStorage
  useEffect(() => {
    const businessSettings =
      business?.settings ?? (business as any)?.businessSettings;

    if (businessSettings) {
      // Use settings from business object (from login response)
      setSettings(businessSettings);
      // Cache in localStorage for offline access
      localStorage.setItem(
        "businessSettings",
        JSON.stringify(businessSettings),
      );
      setIsLoading(false);
    } else {
      // Fallback to localStorage
      const cached = localStorage.getItem("businessSettings");
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as BusinessSettings;
          setSettings(parsed);
        } catch (error) {
          console.error("Failed to parse cached settings:", error);
          setSettings(DEFAULT_SETTINGS);
        }
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
      setIsLoading(false);
    }
  }, [business?.settings, (business as any)?.businessSettings]);

  const refreshSettings = async (): Promise<void> => {
    // Settings are updated immediately by individual update functions (updateCurrency, updateNotifications, etc.)
    // Each update function handles API call and state/localStorage updates on res.ok
    // No need to fetch from backend - this is a no-op now
    return;
  };

  const updateCurrency = async (
    currency: BusinessSettings["currency"],
  ): Promise<boolean> => {
    if (!user?.token || !user?.businessId || !settings) return false;

    try {
      const response = await apiRequest(
        "PUT",
        `/settings/currency/${user?.businessId}`,
        { currency },
        user.token,
      );

      if (response.ok) {
        const updatedSettings = { ...settings, currency };
        setSettings(updatedSettings);
        localStorage.setItem(
          "businessSettings",
          JSON.stringify(updatedSettings),
        );

        // Sync AuthContext with updated business settings
        if (business) {
          const updatedBusiness = { ...business, settings: updatedSettings };
          updateBusiness(updatedBusiness);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update currency:", error);
      return false;
    }
  };

  const updateNotifications = async (
    notifications: BusinessSettings["notifications"],
  ): Promise<boolean> => {
    if (!user?.token || !user?.businessId || !settings) return false;

    try {
      const response = await apiRequest(
        "PUT",
        `/settings/notifications/${user?.businessId}`,
        { notifications },
        user.token,
      );

      if (response.ok) {
        const updatedSettings = { ...settings, notifications };
        setSettings(updatedSettings);
        localStorage.setItem(
          "businessSettings",
          JSON.stringify(updatedSettings),
        );

        // Sync AuthContext with updated business settings
        if (business) {
          const updatedBusiness = { ...business, settings: updatedSettings };
          updateBusiness(updatedBusiness);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update notifications:", error);
      return false;
    }
  };

  const updateSyncData = async (
    syncData: BusinessSettings["syncData"],
  ): Promise<boolean> => {
    if (!user?.token || !user?.businessId || !settings) return false;

    try {
      const response = await apiRequest(
        "PUT",
        `/settings/sync/${user?.businessId}`,
        { syncData },
        user.token,
      );

      if (response.ok) {
        const updatedSettings = { ...settings, syncData };
        setSettings(updatedSettings);
        localStorage.setItem(
          "businessSettings",
          JSON.stringify(updatedSettings),
        );

        // Sync AuthContext with updated business settings
        if (business) {
          const updatedBusiness = { ...business, settings: updatedSettings };
          updateBusiness(updatedBusiness);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update sync data:", error);
      return false;
    }
  };

  const updateUnits = async (
    units: BusinessSettings["units"],
  ): Promise<boolean> => {
    if (!user?.token || !user?.businessId || !settings) return false;

    try {
      const response = await apiRequest(
        "PUT",
        `/settings/units/${user?.businessId}`,
        { units },
        user.token,
      );

      if (response.ok) {
        const updatedSettings = { ...settings, units };
        setSettings(updatedSettings);
        localStorage.setItem(
          "businessSettings",
          JSON.stringify(updatedSettings),
        );

        // Sync AuthContext with updated business settings
        if (business) {
          const updatedBusiness = { ...business, settings: updatedSettings };
          updateBusiness(updatedBusiness);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update units:", error);
      return false;
    }
  };

  const formatCurrency = (amount: number): string => {
    if (!settings?.currency) return `$${amount.toFixed(2)}`;

    // Handle both object and string currency formats for backward compatibility
    const currency = settings.currency;
    if (typeof currency === "string") {
      // Fallback for old format - assume USD
      return `$${amount.toFixed(2)}`;
    }

    const formatted = amount.toFixed(currency.decimalPlaces || 2);
    return `${currency.symbol || "$"} ${formatted}`;
  };

  const getCurrencySymbol = (): string => {
    if (!settings?.currency) return "$";

    const currency = settings.currency;
    if (typeof currency === "string") {
      // For backward compatibility, map common currency codes to symbols
      const currencyMap: Record<string, string> = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        KES: "KSh",
        UGX: "UGX",
        TZS: "TSh",
        ETB: "ETB",
        RWF: "FRw",
      };
      return currencyMap[currency] || "$";
    }

    return currency.symbol || "$";
  };

  const getDecimalPlaces = (): number => {
    if (!settings?.currency) return 2;

    const currency = settings.currency;
    if (typeof currency === "string") {
      // Default decimal places for common currencies
      return 2;
    }

    return currency.decimalPlaces || 2;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateCurrency,
        updateNotifications,
        updateSyncData,
        updateUnits,
        formatCurrency,
        getCurrencySymbol,
        getDecimalPlaces,
        refreshSettings,
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
