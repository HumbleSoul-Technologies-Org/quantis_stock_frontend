// Auth Types
export type UserRole = 'admin' | 'manager' | 'sales';
export type BusinessType = 'retail';
export type RetailSubType = 'electronics' | 'clothing' | 'food_beverage' | 'beauty' | 'home_hardware' | 'general';

export interface BusinessSetup {
  businessName: string;
  businessType: BusinessType;
  retailSubType?: RetailSubType; // Optional for backward compatibility
  currency: string; // Currency code (KES, USD, EUR, etc)
  lowStockThreshold: number; // Percentage of reorder level
  emailAlerts: boolean;
  smsAlerts: boolean;
  lowStockAlerts: boolean;
  saleNotifications: boolean;
  setupCompletedAt: string;
}

export interface User {
  id: string;
  username: string;
  password: string; // hashed in production
  role: UserRole;
  businessSetup?: BusinessSetup; // Optional for backward compatibility
  createdAt: string;
}

// Product Types - Extended ERP Support
export interface UnitOfMeasure {
  unit: string;
  conversionFactor: number; // Relative to base unit
}

export interface SupplierInfo {
  supplierId: string;
  leadTimeDays: number;
  minOrderQuantity: number;
  costPrice: number;
  isPreferred?: boolean;
}

export interface TrackingConfig {
  trackByBatch?: boolean;
  trackBySerial?: boolean;
  requireExpiryDate?: boolean;
}

export interface ReorderStrategy {
  type?: 'fixed' | 'seasonal' | 'automated'; // Default: 'fixed'
  safetyStock?: number; // Buffer stock
  leadTimeDays?: number; // Supplier lead time
  economicOrderQuantity?: number; // Optimal order size
}

export interface Product {
  // Core Fields (Required - existing)
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  costPrice: number;
  unit: string; // kg, lbs, units, etc (base unit)
  supplierId: string;
  reorderLevel: number;
  currentStock: number;
  createdAt: string;
  updatedAt: string;

  // Enhanced Fields (Optional - new)
  description?: string;
  status?: 'active' | 'discontinued'; // Default: 'active'
  retailSubType?: RetailSubType; // For category-specific fields
  
  // Multiple Units of Measure Support
  baseUoM?: string; // Base unit identifier
  alternateUoMs?: UnitOfMeasure[]; // Conversion rates
  
  // Tracking Configuration
  tracking?: TrackingConfig;
  
  // Multiple Suppliers Support
  suppliers?: SupplierInfo[]; // Additional supplier options
  
  // Advanced Reorder Strategy
  reorderStrategy?: ReorderStrategy;
  
  // Multi-Warehouse Support
  warehouseLocations?: string[]; // Warehouse IDs where product exists
  
  // Custom Attributes & Category-Specific Fields
  customAttributes?: Record<string, any>;
  
  // Discontinuation Info
  discontinuedDate?: string;
  discontinuationReason?: string;
}

// Inventory Types
export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference: string; // Purchase order, Sales order, etc
  createdBy: string;
  createdAt: string;
}

export interface InventoryHistory {
  productId: string;
  movements: StockMovement[];
}

// Sales Types
export interface Sale {
  id: string;
  saleNumber: string;
  date: string;
  items: SaleItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes: string;
  createdBy: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  paymentTerms: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

// Category-Specific Field Definitions
export interface CategorySpecificFields {
  electronics?: {
    warranty?: string; // e.g., "1 year", "2 years"
    voltage?: string; // e.g., "110-240V"
    wattage?: string; // e.g., "65W"
    material?: string; // e.g., "Aluminum Alloy"
  };
  clothing?: {
    sizes?: string; // e.g., "S, M, L, XL"
    material?: string; // e.g., "Cotton, Polyester"
    careInstructions?: string; // e.g., "Machine wash cold"
    gender?: 'mens' | 'womens' | 'unisex' | 'kids';
    fit?: string; // e.g., "Regular, Slim, Oversized"
  };
  food_beverage?: {
    ingredients?: string; // Comma-separated
    allergens?: string; // Comma-separated
    expiryDate?: string; // ISO date
    storageInstructions?: string;
    certifications?: string; // Comma-separated: "Organic, Fair Trade"
    volume?: string; // e.g., "500ml"
  };
  beauty?: {
    ingredients?: string; // Comma-separated
    allergens?: string; // Comma-separated
    volume?: string; // e.g., "50ml"
    certifications?: string; // Comma-separated: "Cruelty-free, Vegan"
    skinType?: string; // Comma-separated: "Oily, Dry, Sensitive"
  };
  home_hardware?: {
    dimensions?: string; // e.g., "50x40x10 cm"
    weight?: string; // e.g., "2.5kg"
    material?: string; // e.g., "Solid Wood"
    color?: string;
    warranty?: string;
  };
}

// Settings Types
export interface AppSettings {
  currency: {
    symbol: string;
    code: string;
    decimalPlaces: number;
  };
  units: {
    weight: string; // kg, lbs, oz
    volume: string; // L, ml, gallons
    count: string; // units, boxes
  };
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    lowStockAlerts: boolean;
    saleNotifications: boolean;
  };
  general: {
    companyName: string;
    contactEmail: string;
    theme: 'light' | 'dark';
  };
}

// Report Types
export interface InventorySummary {
  totalProducts: number;
  totalValue: number;
  lowStockItems: Product[];
  averageStockLevel: number;
}

export interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface AppState {
  users: User[];
  currentUser: User | null;
  products: Product[];
  suppliers: Supplier[];
  sales: Sale[];
  stockMovements: StockMovement[];
  settings: AppSettings;
}
