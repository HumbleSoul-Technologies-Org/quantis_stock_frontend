// Auth Types
export type UserRole = 'admin' | 'manager' | 'sales' | 'accountant';
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

export interface Business {
  id: string;
  _id?: string; // For backward compatibility with older business objects
  ownerId: string; // Reference to admin user who owns the business
  businessName: string;
  businessType: BusinessType;
  retailSubType?: RetailSubType;
  currency: string;
  lowStockThreshold: number;
  emailAlerts: boolean;
  smsAlerts: boolean;
  lowStockAlerts: boolean;
  saleNotifications: boolean;
  setupCompletedAt: string;
}

export interface User {
  id: string;
  _id?: string; // For backward compatibility with older user objects
  username: string;
  password?: string; // hashed in production
  role: UserRole;
  businessId?: string; // Reference to Business model (optional during transition)
  business?: BusinessSetup; // Keep for backward compatibility during transition
  createdAt?: string;
  token?: string; // For session management
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
  _id?: string; // For backward compatibility with older product objects
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  costPrice: number;
  unit: string; // kg, lbs, units, etc (base unit)
  supplierId: string;
  reorderLevel: number;
  currentStock: number;
  businessId?: string; // Business isolation (optional during transition)
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
  
  // Cloudinary image data
  imageUrl?: string;
  imagePublicId?: string
  image?: {
    url: string;
    publicId: string;
  }
}

// Inventory Types
export interface StockMovement {
  id: string;
  _id?: string; // For backward compatibility with older movement objects
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference: string; // Purchase order, Sales order, etc
  businessId?: string; // Business isolation (optional during transition)
  createdBy: string | User;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  businessId?: string; // Business isolation (optional during transition)
  createdAt: string;
  updatedAt: string;
}

// Sales Types
export interface Sale {
  id: string;
  _id?: string; // For backward compatibility with older sale objects
  saleNumber: string;
  date: string;
  items: SaleItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes: string;
  businessId?: string; // Business isolation (optional during transition)
  createdBy: string;
  createdAt: string;
  customerName?: string;
  paymentType?: string;
  txnId?: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Supplier Types
export interface Supplier {
  id?: string;
  _id?: string; // For backward compatibility with older supplier objects
  name: string;
  email: string;
  phone: string;
  businessId?: string; // Business isolation (optional during transition)
  // Address as a structured object
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };
  // Contact persons
  contact?: {
    primaryContact?: string;
    primaryPhone?: string;
    secondaryContact?: string;
    secondaryPhone?: string;
  };
  // Payment details
  paymentTerms?: string;
  payment?: {
    bankDetails?: string;
    taxId?: string;
  };
  website?: string;
  // Product ids or names supplied by this supplier
  products?: string[];
  status?: 'active' | 'inactive' | 'blocked';
  rating?: number; // 1-5
  notes?: string;
  documentUrl?: string;
  documentPublicId?: string;
  createdAt?: string;
  updatedAt?: string;
  contract?: {
    url: string;
    public_id?: string;
  };
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

// Team User Type (for credentials management)
export interface TeamUser {
  id: string;
  _id?: string; // For backward compatibility with older user objects
  name: string;
  email: string;
   username?: string; // Added for credentials display
  role: 'sales' | 'accountant' | 'manager';
  createdAt: string;
  lastLogin: string | null;
  token?: string;
  password?: string; // For registration; hashed in production
  isActive?: boolean; // For soft deletion
  isBanned?: boolean; // For banning users without deletion
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
  credentials: {
    teamUsers: TeamUser[];
    passwordPolicy?: {
      minLength: number;
      requireMixedCase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    sessionTimeout?: number; // minutes
  };
}

// Notification Types
export type NotificationType = 'low_stock' | 'stock_out' | 'new_sale' | 'new_product' | 'data_sync' | 'no_internet' | 'credentials_change' | 'admin_credentials_updated' | 'resource_created' | 'resource_updated' | 'resource_deleted' | 'user_profile_created' | 'user_profile_updated' | 'user_profile_deleted' | 'info' | 'success' | 'error' | 'warning';
export type NotificationPriority = 'high' | 'medium' | 'low';

export interface Notification {
  id?: string;
  _id?: string; // For backward compatibility with older notification objects
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  createdAt?: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  productId?: string;
  saleId?: string;
  metadata?: Record<string, any>;
  userId?: string; // For user-specific notifications
  businessId?: string; // For business-wide notifications
  readBy?: string[]; // Array of user IDs who have read this notification
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
  products: Product[] | any;
  suppliers: Supplier[] | any;
  sales: Sale[];
  stockMovements: StockMovement[];
  settings: AppSettings;
}
