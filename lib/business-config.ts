// Business Configuration for Retail
// This defines presets for different business types

export type BusinessType = 'retail';
export type RetailSubType = 'electronics' | 'clothing' | 'food_beverage' | 'beauty' | 'home_hardware' | 'general';

export interface BusinessConfig {
  categories: string[];
  units: string[];
  currencies: {
    code: string;
    symbol: string;
    name: string;
  }[];
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

// Retail subtypes with specific categories
const ELECTRONICS_CONFIG: BusinessConfig = {
  categories: [
    'Computers & Laptops',
    'Mobile Phones & Tablets',
    'Audio (Headphones, Speakers)',
    'Cameras',
    'Gaming Equipment',
    'Accessories (Cables, Chargers, Cases)',
    'Software',
    'Other Electronics',
  ],
  units: ['units', 'pieces', 'boxes', 'cartons'],
  currencies: CURRENCIES,
  lowStockWarningThreshold: 20,
};

const CLOTHING_CONFIG: BusinessConfig = {
  categories: [
    'Mens Clothing',
    'Womens Clothing',
    'Childrens Clothing',
    'Footwear',
    'Accessories (Bags, Belts, Jewelry)',
    'Activewear & Sportswear',
    'Unisex Clothing',
    'Other Apparel',
  ],
  units: ['units', 'pieces', 'boxes'],
  currencies: CURRENCIES,
  lowStockWarningThreshold: 20,
};

const FOOD_BEVERAGE_CONFIG: BusinessConfig = {
  categories: [
    'Fresh Produce',
    'Dairy & Eggs',
    'Meat & Seafood',
    'Bakery',
    'Beverages',
    'Snacks & Pantry',
    'Frozen Foods',
    'Other Food & Beverage',
  ],
  units: ['units', 'kg', 'lbs', 'L', 'ml', 'gallons', 'boxes'],
  currencies: CURRENCIES,
  lowStockWarningThreshold: 20,
};

const BEAUTY_CONFIG: BusinessConfig = {
  categories: [
    'Skincare',
    'Haircare',
    'Makeup & Cosmetics',
    'Fragrances',
    'Health & Wellness',
    'Personal Hygiene',
    'Accessories (Tools, Brushes)',
    'Other Beauty & Personal Care',
  ],
  units: ['units', 'ml', 'oz'],
  currencies: CURRENCIES,
  lowStockWarningThreshold: 20,
};

const HOME_HARDWARE_CONFIG: BusinessConfig = {
  categories: [
    'Furniture',
    'Home Decor',
    'Bedding & Linens',
    'Kitchen & Dining',
    'Lighting',
    'Hardware & Tools',
    'Building Materials',
    'Garden & Outdoor',
    'Other Home & Hardware',
  ],
  units: ['units', 'pieces', 'boxes', 'kg', 'L', 'm', 'cm'],
  currencies: CURRENCIES,
  lowStockWarningThreshold: 20,
};

const MEDICINE_CONFIG: BusinessConfig = {
  categories: [
    'Prescription Medicines',
    'Over-the-Counter Medicines',
    'Supplements & Vitamins',
    'Pain Relief',
    'Cold & Flu',
    'Digestive Health',
    'Herbal & Natural',
    'Medical Devices',
    'First Aid',
    'Other Medicine',
  ],
  units: ['units', 'tablets', 'capsules', 'ml', 'L', 'boxes', 'bottles'],
  currencies: CURRENCIES,
  lowStockWarningThreshold: 20,
};

const GENERAL_RETAIL_CONFIG: BusinessConfig = {
  categories: [
    'Electronics',
    'Clothing',
    'Food & Beverages',
    'Medicine & Healthcare',
    'Accessories',
    'Home & Garden',
    'Sports & Outdoors',
    'Books & Media',
    'Toys & Games',
    'Beauty & Personal Care',
    'Hardware & Building Materials',
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
  lowStockWarningThreshold: 20,
};

// Retail-focused business configuration (default)
export const RETAIL_CONFIG: BusinessConfig = GENERAL_RETAIL_CONFIG;

// Business configuration map by retail subtype
export const RETAIL_SUBTYPE_CONFIGS: Record<RetailSubType, BusinessConfig> = {
  electronics: ELECTRONICS_CONFIG,
  clothing: CLOTHING_CONFIG,
  food_beverage: FOOD_BEVERAGE_CONFIG,
  beauty: BEAUTY_CONFIG,
  home_hardware: HOME_HARDWARE_CONFIG,
  general: GENERAL_RETAIL_CONFIG,
};

// Business configuration map
export const BUSINESS_CONFIGS: Record<BusinessType, BusinessConfig> = {
  retail: RETAIL_CONFIG,
};

export function getBusinessConfig(businessType: BusinessType): BusinessConfig {
  return BUSINESS_CONFIGS[businessType] || RETAIL_CONFIG;
}

export function getRetailSubtypeConfig(subtype: RetailSubType): BusinessConfig {
  return RETAIL_SUBTYPE_CONFIGS[subtype] || GENERAL_RETAIL_CONFIG;
}

export const RETAIL_SUBTYPES = [
  { value: 'electronics', label: 'Electronics & Gadgets' },
  { value: 'clothing', label: 'Clothing & Fashion' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'beauty', label: 'Beauty & Personal Care' },
  { value: 'home_hardware', label: 'Home, Hardware & Building Materials' },
  { value: 'general', label: 'General Retail (Mixed Categories)' },
] as const;

// ============================================
// FIELD SCHEMA DEFINITIONS
// ============================================

export interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'date' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  rows?: number;
  fullWidth?: boolean;
  options?: string[];
}

export interface CategoryFieldSchema {
  name: string;
  fields: FieldDefinition[];
}

export const CATEGORY_FIELD_SCHEMAS: Record<string, CategoryFieldSchema> = {
  electronics: {
    name: 'Electronics Specifications',
    fields: [
      { key: 'warranty', label: 'Warranty', type: 'text', placeholder: 'e.g., 1 year' },
      { key: 'voltage', label: 'Voltage', type: 'text', placeholder: 'e.g., 110-240V' },
      { key: 'wattage', label: 'Wattage', type: 'text', placeholder: 'e.g., 65W' },
      { key: 'material', label: 'Material', type: 'text', placeholder: 'e.g., Aluminum' },
    ],
  },
  clothing: {
    name: 'Clothing Specifications',
    fields: [
      { key: 'sizes', label: 'Sizes', type: 'text', placeholder: 'e.g., S, M, L, XL' },
      { key: 'material', label: 'Material', type: 'text', placeholder: 'e.g., Cotton' },
      { key: 'fit', label: 'Fit', type: 'text', placeholder: 'e.g., Regular' },
      { key: 'gender', label: 'Gender', type: 'select', options: ['Mens', 'Womens', 'Unisex', 'Kids'] },
      {
        key: 'careInstructions',
        label: 'Care Instructions',
        type: 'textarea',
        placeholder: 'e.g., Machine wash cold',
        rows: 2,
        fullWidth: true,
      },
    ],
  },
  food_beverage: {
    name: 'Food & Beverage',
    fields: [
      { key: 'volume', label: 'Volume', type: 'text', placeholder: 'e.g., 500ml' },
      { key: 'expiryDate', label: 'Expiry Date', type: 'date' },
      {
        key: 'ingredients',
        label: 'Ingredients',
        type: 'textarea',
        placeholder: 'Comma-separated',
        rows: 2,
        fullWidth: true,
      },
      { key: 'allergens', label: 'Allergens', type: 'text', placeholder: 'e.g., Contains nuts', fullWidth: true },
      { key: 'storageInstructions', label: 'Storage', type: 'text', placeholder: 'e.g., Refrigerate', fullWidth: true },
    ],
  },
  medicine: {
    name: 'Medicine & Healthcare',
    fields: [
      { key: 'dosage', label: 'Dosage/Size', type: 'text', placeholder: 'e.g., 500mg, 100ml' },
      { key: 'expiryDate', label: 'Expiry Date', type: 'date' },
      {
        key: 'activeIngredients',
        label: 'Active Ingredients',
        type: 'textarea',
        placeholder: 'e.g., Paracetamol, Ibuprofen',
        rows: 2,
        fullWidth: true,
      },
      { key: 'warnings', label: 'Warnings/Cautions', type: 'text', placeholder: 'e.g., Not for children under 12', fullWidth: true },
      { key: 'storageInstructions', label: 'Storage Instructions', type: 'text', placeholder: 'e.g., Store in cool, dry place', fullWidth: true },
      { key: 'manufacturer', label: 'Manufacturer', type: 'text', placeholder: 'e.g., Pharma Company Ltd' },
      { key: 'batchNumber', label: 'Batch Number', type: 'text', placeholder: 'e.g., BAT2024001' },
    ],
  },
  beauty: {
    name: 'Beauty & Personal Care',
    fields: [
      { key: 'volume', label: 'Volume', type: 'text', placeholder: 'e.g., 50ml' },
      { key: 'skinType', label: 'Skin Type', type: 'text', placeholder: 'e.g., Oily, Dry' },
      {
        key: 'ingredients',
        label: 'Ingredients',
        type: 'textarea',
        placeholder: 'Comma-separated',
        rows: 2,
        fullWidth: true,
      },
      { key: 'certifications', label: 'Certifications', type: 'text', placeholder: 'e.g., Cruelty-free', fullWidth: true },
    ],
  },
  home_hardware: {
    name: 'Home & Hardware',
    fields: [
      { key: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'e.g., 50x40x10 cm' },
      { key: 'weight', label: 'Weight', type: 'text', placeholder: 'e.g., 2.5kg' },
      { key: 'material', label: 'Material', type: 'text', placeholder: 'e.g., Wood' },
      { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g., Walnut' },
      { key: 'warranty', label: 'Warranty', type: 'text', placeholder: 'e.g., 5 years', fullWidth: true },
    ],
  },
  accessories: {
    name: 'Accessories Specifications',
    fields: [
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g., Sony' },
      { key: 'model', label: 'Model', type: 'text', placeholder: 'e.g., XB900N' },
      { key: 'size', label: 'Size', type: 'text', placeholder: 'e.g., Standard' },
      { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g., Black' },
      { key: 'connectorType', label: 'Connector Type', type: 'text', placeholder: 'e.g., USB-C, 3.5mm' },
      { key: 'material', label: 'Material', type: 'text', placeholder: 'e.g., Plastic, Aluminum' },
      { key: 'warranty', label: 'Warranty', type: 'text', placeholder: 'e.g., 1 year', fullWidth: true },
    ],
  },
  hardware: {
    name: 'Hardware Specifications',
    fields: [
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g., Bosch, DeWalt' },
      { key: 'model', label: 'Model', type: 'text', placeholder: 'e.g., GSR 18V' },
      { key: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'e.g., 50x40x10 cm' },
      { key: 'weight', label: 'Weight', type: 'text', placeholder: 'e.g., 2.5kg' },
      { key: 'material', label: 'Material', type: 'text', placeholder: 'e.g., Steel, Aluminum' },
      { key: 'finish', label: 'Finish', type: 'text', placeholder: 'e.g., Powder-coated' },
      { key: 'voltage', label: 'Voltage (if applicable)', type: 'text', placeholder: 'e.g., 18V, 230V' },
      { key: 'warranty', label: 'Warranty', type: 'text', placeholder: 'e.g., 3 years', fullWidth: true },
    ],
  },
  building_material: {
    name: 'Building Material Specifications',
    fields: [
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g., Lafarge' },
      { key: 'materialType', label: 'Material Type', type: 'text', placeholder: 'e.g., Cement, Timber' },
      { key: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'e.g., 2x4x8 meters' },
      { key: 'weight', label: 'Weight', type: 'text', placeholder: 'e.g., 50kg' },
      { key: 'unit', label: 'Unit Size', type: 'text', placeholder: 'e.g., Per bag, Per sheet' },
      { key: 'grade', label: 'Grade/Quality', type: 'text', placeholder: 'e.g., Grade A, Standard' },
      { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g., Natural, Red' },
      { key: 'strength', label: 'Strength Rating', type: 'text', placeholder: 'e.g., M20, PSI 1000', fullWidth: true },
    ],
  },
};

/**
 * Get field schema for a category name
 * Maps category strings to their field definitions
 */
export function getFieldSchemaForCategory(categoryName: string): CategoryFieldSchema | null {
  if (!categoryName) return null;

  // Map category names to schema types
  const categoryToSchemaMap: Record<string, string> = {
    // General retail categories
    'Electronics': 'electronics',
    'Clothing': 'clothing',
    'Food & Beverages': 'food_beverage',
    'Medicine & Healthcare': 'medicine',
    'Beauty & Personal Care': 'beauty',
    'Home & Garden': 'home_hardware',

    // Electronics
    'Computers & Laptops': 'electronics',
    'Mobile Phones & Tablets': 'electronics',
    'Audio (Headphones, Speakers)': 'electronics',
    'Cameras': 'electronics',
    'Gaming Equipment': 'electronics',
    'Accessories (Cables, Chargers, Cases)': 'electronics',
    'Software': 'electronics',
    'Other Electronics': 'electronics',

    // Clothing
    'Mens Clothing': 'clothing',
    'Womens Clothing': 'clothing',
    'Childrens Clothing': 'clothing',
    'Footwear': 'clothing',
    'Accessories (Bags, Belts, Jewelry)': 'clothing',
    'Activewear & Sportswear': 'clothing',
    'Unisex Clothing': 'clothing',
    'Other Apparel': 'clothing',

    // Food & Beverage
    'Fresh Produce': 'food_beverage',
    'Dairy & Eggs': 'food_beverage',
    'Meat & Seafood': 'food_beverage',
    'Bakery': 'food_beverage',
    'Beverages': 'food_beverage',
    'Snacks & Pantry': 'food_beverage',
    'Frozen Foods': 'food_beverage',
    'Other Food & Beverage': 'food_beverage',

    // Medicine
    'Prescription Medicines': 'medicine',
    'Over-the-Counter Medicines': 'medicine',
    'Supplements & Vitamins': 'medicine',
    'Pain Relief': 'medicine',
    'Cold & Flu': 'medicine',
    'Digestive Health': 'medicine',
    'Herbal & Natural': 'medicine',
    'Medical Devices': 'medicine',
    'First Aid': 'medicine',
    'Other Medicine': 'medicine',

    // Beauty
    'Skincare': 'beauty',
    'Haircare': 'beauty',
    'Makeup & Cosmetics': 'beauty',
    'Fragrances': 'beauty',
    'Health & Wellness': 'beauty',
    'Personal Hygiene': 'beauty',
    'Accessories (Tools, Brushes)': 'beauty',
    'Other Beauty & Personal Care': 'beauty',

    // Home & Hardware
    'Furniture': 'home_hardware',
    'Home Decor': 'home_hardware',
    'Bedding & Linens': 'home_hardware',
    'Kitchen & Dining': 'home_hardware',
    'Lighting': 'home_hardware',
    'Hardware & Tools': 'hardware',
    'Building Materials': 'building_material',
    'Garden & Outdoor': 'home_hardware',
    'Other Home & Hardware': 'home_hardware',

    // Accessories
    'Accessories': 'accessories',

    // Hardware
    'Hardware': 'hardware',

    // Building Materials
    'Building Material': 'building_material',

    // Combined category (from general retail)
    'Hardware & Building Materials': 'hardware',
  };

  const schemaType = categoryToSchemaMap[categoryName];
  return schemaType ? CATEGORY_FIELD_SCHEMAS[schemaType] || null : null;
}
