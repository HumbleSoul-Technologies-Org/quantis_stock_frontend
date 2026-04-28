/**
 * Currency Converter Utility
 * Provides exchange rate fetching with stale-while-revalidate caching
 * Uses a free public provider by default and falls back to static rates if unavailable
 */

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const API_BASE =
  process.env.NEXT_PUBLIC_CURRENCY_API_BASE?.trim() || "https://open.er-api.com/v6";

/**
 * Static fallback exchange rates (USD base)
 * Last updated: April 2026 - approximate rates for offline/fallback use
 * These ensure the app works even if external APIs are unavailable
 */
const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
  KES: 129.5, // Kenyan Shilling
  UGX: 3800, // Ugandan Shilling
  MXN: 17.05,
  BRL: 4.97,
  SGD: 1.35,
  HKD: 7.78,
  NZD: 1.62,
  SEK: 10.5,
  NOK: 10.42,
  DKK: 6.85,
  ZAR: 18.5,
  RUB: 91.5,
  TRY: 32.5,
  AED: 3.67,
  SAR: 3.75,
  QAR: 3.64,
  PHP: 56.5,
  THB: 35.5,
  IDR: 15500,
  MYR: 4.7,
  VND: 24500,
  PKR: 278,
  BDT: 105,
};

export interface ExchangeRates {
  [currencyCode: string]: number;
}

export interface CacheEntry {
  rates: ExchangeRates;
  timestamp: number;
  baseCurrency: string;
}

/**
 * Get cached exchange rates from localStorage
 */
function getCachedRates(baseCurrency: string): CacheEntry | null {
  try {
    const cacheKey = `currency_rates_${baseCurrency}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    const age = Date.now() - entry.timestamp;

    // Return cache only if it's still fresh (< 24 hours)
    if (age < CACHE_DURATION) {
      return entry;
    }

    return null; // Cache is stale
  } catch (error) {
    console.error("Failed to read cached rates:", error);
    return null;
  }
}

/**
 * Save exchange rates to localStorage with timestamp
 */
function setCachedRates(
  baseCurrency: string,
  rates: ExchangeRates
): CacheEntry {
  try {
    const entry: CacheEntry = {
      rates,
      timestamp: Date.now(),
      baseCurrency,
    };

    const cacheKey = `currency_rates_${baseCurrency}`;
    localStorage.setItem(cacheKey, JSON.stringify(entry));

    return entry;
  } catch (error) {
    console.error("Failed to cache rates:", error);
    return {
      rates,
      timestamp: Date.now(),
      baseCurrency,
    };
  }
}

/**
 * Fetch exchange rates from API
 * Returns null on error (doesn't throw)
 */
async function fetchFromAPI(baseCurrency: string): Promise<ExchangeRates | null> {
  try {
    const response = await fetch(`${API_BASE}/latest/${baseCurrency}`);

    if (!response.ok) {
      console.error(`API returned ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const rates = data?.rates;

    if (!rates || typeof rates !== "object") {
      const responsePreview = JSON.stringify(data).slice(0, 500);
      const errorMsg = data?.result === "error"
        ? `API Error: ${JSON.stringify(data.error ?? data)}`
        : data?.error
          ? `API Error: ${JSON.stringify(data.error)}`
          : "";
      console.error(
        `Invalid API response for currency '${baseCurrency}'. Response: ${responsePreview}. ${errorMsg}`
      );
      return null;
    }

    return rates as ExchangeRates;
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    return null;
  }
}

/**
 * Stale-While-Revalidate: Fetch exchange rates with smart caching
 *
 * Logic:
 * 1. Check if cached rates exist and are fresh (<24h) → return cached immediately
 * 2. If cache is stale or missing → fetch from API
 * 3. Cache new rates with timestamp
 *
 * Returns cached rates even if fetch fails (graceful degradation)
 */
export async function fetchExchangeRates(
  baseCurrency: string
): Promise<{ rates: ExchangeRates; isFresh: boolean; error: string | null }> {
  // Check cache first
  const cached = getCachedRates(baseCurrency);
  if (cached) {
    return {
      rates: cached.rates,
      isFresh: true,
      error: null,
    };
  }

  // Cache is stale or missing, fetch fresh data
  const freshRates = await fetchFromAPI(baseCurrency);

  if (freshRates) {
    setCachedRates(baseCurrency, freshRates);
    return {
      rates: freshRates,
      isFresh: true,
      error: null,
    };
  }

  // Fetch failed, try to use stale cache as fallback
  const staleCached = localStorage.getItem(`currency_rates_${baseCurrency}`);
  if (staleCached) {
    try {
      const entry: CacheEntry = JSON.parse(staleCached);
      return {
        rates: entry.rates,
        isFresh: false,
        error: "Using cached rates (API fetch failed)",
      };
    } catch (error) {
      console.error("Failed to parse stale cache:", error);
    }
  }

  // No cache available, use static fallback rates (offline/emergency use)
  console.warn(
    `Using fallback exchange rates for ${baseCurrency}. API unavailable and no cached rates found.`
  );
  return {
    rates: baseCurrency === "USD" ? FALLBACK_RATES : FALLBACK_RATES,
    isFresh: false,
    error: "Using fallback rates (API and cache unavailable)",
  };
}

/**
 * Convert amount from one currency to another
 * Uses stale-while-revalidate pattern for rate fetching
 *
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code (e.g., "USD")
 * @param toCurrency - Target currency code (e.g., "EUR")
 * @param baseCurrency - Business base currency for rate calculations
 * @param rates - Exchange rates object (fromCurrency and toCurrency must be in this)
 * @returns Converted amount (rounded to 2 decimals)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  baseCurrency: string,
  rates: ExchangeRates
): number {
  // Same currency - no conversion needed
  if (fromCurrency === toCurrency) {
    return Math.round(amount * 100) / 100;
  }

  try {
    // If converting TO base currency
    if (toCurrency === baseCurrency) {
      const rate = rates[fromCurrency];
      if (!rate) {
        console.warn(`No rate found for ${fromCurrency} → ${toCurrency}`);
        return amount;
      }
      // Divide by rate to get base currency amount
      return Math.round((amount / rate) * 100) / 100;
    }

    // If converting FROM base currency
    if (fromCurrency === baseCurrency) {
      const rate = rates[toCurrency];
      if (!rate) {
        console.warn(`No rate found for ${fromCurrency} → ${toCurrency}`);
        return amount;
      }
      // Multiply by rate to get target currency amount
      return Math.round((amount * rate) * 100) / 100;
    }

    // Convert between two non-base currencies (X → Base → Y)
    const fromToBaseRate = rates[fromCurrency];
    const baseToToRate = rates[toCurrency];

    if (!fromToBaseRate || !baseToToRate) {
      console.warn(`No rate found for ${fromCurrency} → ${toCurrency}`);
      return amount;
    }

    const baseAmount = amount / fromToBaseRate;
    return Math.round((baseAmount * baseToToRate) * 100) / 100;
  } catch (error) {
    console.error("Conversion error:", error);
    return amount;
  }
}

/**
 * Format amount as currency string
 * @param amount - Amount to format
 * @param currencyCode - Currency code (e.g., "USD")
 * @param symbol - Currency symbol (e.g., "$")
 * @param decimals - Number of decimal places
 * @returns Formatted string (e.g., "$1,234.56")
 */
export function formatCurrencyAmount(
  amount: number,
  currencyCode: string,
  symbol: string = "$",
  decimals: number = 2
): string {
  try {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: true,
    }).format(amount);

    return `${symbol}${formatted}`;
  } catch (error) {
    console.error("Format error:", error);
    return `${symbol}${amount.toFixed(decimals)}`;
  }
}

/**
 * Get exchange rate between two currencies
 * @returns Exchange rate multiplier (null if not available)
 */
export function getExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  baseCurrency: string,
  rates: ExchangeRates
): number | null {
  if (fromCurrency === toCurrency) return 1;

  if (fromCurrency === baseCurrency) {
    return rates[toCurrency] || null;
  }

  if (toCurrency === baseCurrency) {
    const rate = rates[fromCurrency];
    return rate ? 1 / rate : null;
  }

  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (!fromRate || !toRate) return null;
  return toRate / fromRate;
}

/**
 * Get formatted timestamp for when rates were last cached
 */
export function getLastRateUpdateTime(baseCurrency: string): string | null {
  try {
    const cacheKey = `currency_rates_${baseCurrency}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    const date = new Date(entry.timestamp);

    return date.toLocaleString();
  } catch (error) {
    return null;
  }
}

/**
 * Clear cached rates for a currency
 */
export function clearCachedRates(baseCurrency: string): void {
  try {
    const cacheKey = `currency_rates_${baseCurrency}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error("Failed to clear cache:", error);
  }
}
