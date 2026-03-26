// Business Configuration for Retail
// This defines presets for different business types

export type BusinessType = 'retail';

export interface BusinessConfig {
  categories: string[];
  units: string[];
  currencies: {
    code: string;
    symbol: string;
    name: string;
  }[];
  defaultCurrency: string;
  lowStockWarningThreshold: number;
}

// East African currencies + Major international
export const CURRENCIES = [
  // East African
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  { code: 'RWF', symbol: 'Fr', name: 'Rwandan Franc' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  
  // Major International
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

// Retail-focused business configuration
export const RETAIL_CONFIG: BusinessConfig = {
  categories: [
    'Electronics',
    'Clothing',
    'Footwear',
    'Accessories',
    'Home & Garden',
    'Sports & Outdoors',
    'Books & Media',
    'Toys & Games',
    'Beauty & Personal Care',
    'Food & Beverages',
    'Health & Wellness',
    'Office Supplies',
    'Hardware',
    'Other',
  ],
  units: [
    'units',
    'pieces',
    'boxes',
    'cartons',
    'kg',
    'lbs',
    'oz',
    'L',
    'ml',
    'gallons',
  ],
  currencies: CURRENCIES,
  defaultCurrency: 'KES', // Default to Kenyan Shilling for East Africa
  lowStockWarningThreshold: 20, // Alert when stock reaches 20% of reorder level
};

// Business configuration map
export const BUSINESS_CONFIGS: Record<BusinessType, BusinessConfig> = {
  retail: RETAIL_CONFIG,
};

export function getBusinessConfig(businessType: BusinessType): BusinessConfig {
  return BUSINESS_CONFIGS[businessType] || RETAIL_CONFIG;
}
