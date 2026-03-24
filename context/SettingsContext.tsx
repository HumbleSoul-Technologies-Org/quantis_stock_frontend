'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings } from '@/lib/types';
import { storage } from '@/lib/storage';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  formatCurrency: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Initialize from storage on mount
  useEffect(() => {
    const storedSettings = storage.getSettings();
    setSettings(storedSettings);
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>): void => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated as AppSettings);
    storage.updateSettings(newSettings);
  };

  const formatCurrency = (amount: number): string => {
    if (!settings) return amount.toString();
    const { currency } = settings;
    const formatted = amount.toFixed(currency.decimalPlaces);
    return `${currency.symbol}${formatted}`;
  };

  if (!settings) {
    return <>{children}</>;
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, formatCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
