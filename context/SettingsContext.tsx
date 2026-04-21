"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { BusinessSettings } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import {
  fetchExchangeRates,
  convertCurrency,
  formatCurrencyAmount,
  getExchangeRate,
  getLastRateUpdateTime,
  clearCachedRates,
  ExchangeRates,
} from "@/lib/currencyConverter";

import { useQuery } from "@tanstack/react-query";
import { set } from "date-fns";

interface SettingsContextType {
  settings: BusinessSettings | null;
  isLoading: boolean;
  updateCurrency: (currency: BusinessSettings["currency"]) => Promise<boolean>;
  updateNotifications: (
    notifications: BusinessSettings["notifications"],
  ) => Promise<boolean>;
  updateSyncData: (syncData: BusinessSettings["syncData"]) => Promise<boolean>;
  updateUnits: (units: BusinessSettings["units"]) => Promise<boolean>;
  updateSecurity: (security: BusinessSettings["security"]) => Promise<boolean>;
  formatCurrency: (amount: number) => string;
  getCurrencySymbol: () => string;
  getDecimalPlaces: () => number;
  refreshSettings: () => Promise<void>;
  // Currency conversion methods
  convert: (amount: number, fromCurrency: string, toCurrency: string) => number;
  formatAs: (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ) => string;
  getRate: (fromCurrency: string, toCurrency: string) => number | null;
  refreshExchangeRates: () => Promise<void>;
  // Exchange rate state
  exchangeRates: ExchangeRates | null;
  ratesLoading: boolean;
  ratesError: string | null;
  lastRateUpdate: string | null;
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
  weightUnits: ["kg", "lbs", "oz", "g"],
  volumeUnits: ["L", "ml", "gallons", "fl oz"],
  lengthUnits: ["m", "cm", "mm", "inches", "feet", "km", "yards"],
  countUnits: [
    "units",
    "pieces",
    "boxes",
    "cases",
    "packs",
    "cartons",
    "bottles",
    "tablets",
    "capsules",
  ],
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

const DEFAULT_SECURITY = {
  autoLogoutTimeout: 0, // 0 = disabled
};

const DEFAULT_SETTINGS: BusinessSettings = {
  businessId: "",
  currency: DEFAULT_CURRENCY,
  units: DEFAULT_UNITS,
  syncData: DEFAULT_SYNC_DATA,
  notifications: DEFAULT_NOTIFICATIONS,
  security: DEFAULT_SECURITY,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(
    null,
  );
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [lastRateUpdate, setLastRateUpdate] = useState<string | null>(null);
  const { user, business, updateBusiness } = useAuth();

  // Initialize settings from business data or localStorage
  useEffect(() => {
    const businessSettings =
      business?.settings ?? (business as any)?.businessSettings;

    if (businessSettings) {
      // Use settings from business object (from login response)
      setSettings(businessSettings as any);
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

  // Fetch exchange rates when currency changes (stale-while-revalidate pattern)
  useEffect(() => {
    if (!settings?.currency?.code) return;

    const baseCurrency = settings.currency.code;
    const fetchRates = async () => {
      setRatesLoading(true);
      setRatesError(null);

      try {
        const result = await fetchExchangeRates(baseCurrency);
        setExchangeRates(result.rates);

        if (result.error) {
          setRatesError(result.error);
        } else {
          setRatesError(null);
        }

        // Update last rate update time from localStorage
        const lastUpdate = getLastRateUpdateTime(baseCurrency);
        setLastRateUpdate(lastUpdate);
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        setRatesError("Failed to load exchange rates");
      } finally {
        setRatesLoading(false);
      }
    };

    fetchRates();
  }, [settings?.currency?.code]);

  const refreshSettings = async (): Promise<void> => {
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

        // Clear old exchange rates and fetch new ones for the new currency
        if (typeof currency === "object" && currency.code) {
          clearCachedRates(currency.code);
          // Trigger fetch will happen via useEffect when settings change
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
        user?.token,
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

  const updateSecurity = async (
    security: BusinessSettings["security"],
  ): Promise<boolean> => {
    if (!user?.token || !user?.businessId || !settings) return false;

    try {
      const response = await apiRequest(
        "PUT",
        `/settings/security/${user?.businessId}`,
        { security },
        user.token,
      );

      if (response.ok) {
        const updatedSettings = { ...settings, security };
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
      console.error("Failed to update security settings:", error);
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

  // Convert amount from one currency to another
  const convert = useCallback(
    (amount: number, fromCurrency: string, toCurrency: string): number => {
      if (!settings?.currency?.code || !exchangeRates) {
        return amount;
      }

      return convertCurrency(
        amount,
        fromCurrency,
        toCurrency,
        settings.currency.code,
        exchangeRates,
      );
    },
    [settings?.currency?.code, exchangeRates],
  );

  // Format converted amount as currency string
  const formatAs = useCallback(
    (amount: number, fromCurrency: string, toCurrency: string): string => {
      if (!settings?.currency?.code || !exchangeRates) {
        return formatCurrencyAmount(
          amount,
          toCurrency,
          settings?.currency?.symbol || "$",
          settings?.currency?.decimalPlaces || 2,
        );
      }

      const converted = convertCurrency(
        amount,
        fromCurrency,
        toCurrency,
        settings.currency.code,
        exchangeRates,
      );

      // Get symbol for target currency (fallback to code if not found)
      const symbolMap: Record<string, string> = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        KES: "KSh",
        UGX: "UGX",
        TZS: "TSh",
        ETB: "ETB",
        RWF: "FRw",
        JPY: "¥",
        INR: "₹",
        AUD: "A$",
        CAD: "C$",
        CHF: "CHF",
        CNY: "¥",
      };

      const symbol = symbolMap[toCurrency] || toCurrency;

      return formatCurrencyAmount(
        converted,
        toCurrency,
        symbol,
        settings?.currency?.decimalPlaces || 2,
      );
    },
    [settings?.currency, exchangeRates],
  );

  // Get exchange rate between two currencies
  const getRate = useCallback(
    (fromCurrency: string, toCurrency: string): number | null => {
      if (!settings?.currency?.code || !exchangeRates) {
        return null;
      }

      return getExchangeRate(
        fromCurrency,
        toCurrency,
        settings.currency.code,
        exchangeRates,
      );
    },
    [settings?.currency?.code, exchangeRates],
  );

  // Refresh exchange rates (forces API call, ignores cache)
  const refreshExchangeRates = useCallback(async (): Promise<void> => {
    if (!settings?.currency?.code) return;

    const baseCurrency = settings.currency.code;
    setRatesLoading(true);
    setRatesError(null);

    try {
      // Clear cache to force fresh API call
      clearCachedRates(baseCurrency);

      const result = await fetchExchangeRates(baseCurrency);
      setExchangeRates(result.rates);

      if (result.error) {
        setRatesError(result.error);
      } else {
        setRatesError(null);
      }

      // Update last rate update time from localStorage
      const lastUpdate = getLastRateUpdateTime(baseCurrency);
      setLastRateUpdate(lastUpdate);
    } catch (error) {
      console.error("Failed to refresh exchange rates:", error);
      setRatesError("Failed to refresh exchange rates");
    } finally {
      setRatesLoading(false);
    }
  }, [settings?.currency?.code]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateCurrency,
        updateNotifications,
        updateSyncData,
        updateUnits,
        updateSecurity,
        formatCurrency,
        getCurrencySymbol,
        getDecimalPlaces,
        refreshSettings,
        convert,
        formatAs,
        getRate,
        refreshExchangeRates,
        exchangeRates,
        ratesLoading,
        ratesError,
        lastRateUpdate,
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
