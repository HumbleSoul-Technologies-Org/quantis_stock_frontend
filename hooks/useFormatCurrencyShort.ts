import { useSettings } from "@/context/SettingsContext";

/**
 * Hook to format currency values to short form
 * Examples:
 * - 500 → $500.00
 * - 5000 → $5.00K
 * - 50000 → $50.00K
 * - 1000000 → $1.00M
 * - 5500000 → $5.50M
 * - -1500 → -$1.50K
 */
export function useFormatCurrencyShort() {
  const { getCurrencySymbol } = useSettings();
  const symbol = getCurrencySymbol();

  const formatCurrencyShort = (value: number): string => {
    // Handle edge cases
    if (!Number.isFinite(value)) {
      return `${symbol}0.00`;
    }

    const absValue = Math.abs(value);
    const isNegative = value < 0;

    // Values less than 1000 - no abbreviation
    if (absValue < 1000) {
      return `${isNegative ? "-" : ""}${symbol} ${absValue.toFixed(2)}`;
    }

    // Values 1,000,000 and above - use M
    if (absValue >= 1000000) {
      const millions = absValue / 1000000;
      return `${isNegative ? "-" : ""}${symbol} ${millions.toFixed(2)}M`;
    }

    // Values 1,000 to 999,999 - use K
    const thousands = absValue / 1000;
    return `${isNegative ? "-" : ""}${symbol} ${thousands.toFixed(2)}K`;
  };

  return formatCurrencyShort;
}
