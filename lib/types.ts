// Auth Types
export type UserRole = "admin" | "manager" | "sales" | "accountant";
export type BusinessType = "retail" | "other" | "wholesaler" | "manufacturer";
export type RetailSubType =
  | "electronics"
  | "clothing"
  | "food_beverage"
  | "beauty"
  | "home_hardware"
  | "general";

export interface BusinessSettings {
  businessId: string;
  currency: {
    code: string;
    symbol: string;
    decimalPlaces: number;
  };
  units: {
    weightUnits: string[];
    volumeUnits: string[];
    lengthUnits: string[];
    countUnits: string[];
  };
  notifications: {
    resourceChanges: { email: boolean; sms: boolean };
    salesAlert: { email: boolean; sms: boolean };
    loginFailAttempts: { email: boolean; sms: boolean };
    systemUpdate: { email: boolean; sms: boolean };
    returns: { email: boolean; sms: boolean };
    lowStock: { email: boolean; sms: boolean };
    userProfileChanges: { email: boolean; sms: boolean };
  };
  security: {
    autoLogoutTimeout: number;
  };
  // Manufacturing-specific settings (optional)
  production?: {
    enabled: boolean;
    defaultLeadTimeDays?: number;
    defaultYieldPercent?: number;
  };
}

export interface BusinessOnboardingPayload {
  ownerId: string;
  businessName: string;
  businessType: BusinessType;
  businessEmail?: {
    email: string;
    verified: boolean;
  };
  businessPhone?: {
    contact: string;
    verified: boolean;
  };
  businessAddress?: string;
  // Manufacturer-specific optional fields
  factoryAddress?: string;
  taxId?: string;
  productionLeadTime?: number;
  setupCompletedAt: string;
  settings: {
    currency: {
      code: string;
      symbol: string;
      decimalPlaces: number;
    };
    notifications: BusinessSettings["notifications"];
    production?: BusinessSettings["production"];
  };
}

export interface BusinessSetup {
  businessName: string;
  businessType: BusinessType;
  businessEmail?: {
    email: string;
    verified: boolean;
  };
  businessPhone?: {
    contact: string;
    verified: boolean;
  };
  businessAddress?: string; // Optional business address
  retailSubType?: RetailSubType; // Optional for backward compatibility
  currency: string; // Currency code (KES, USD, EUR, etc)
  lowStockThreshold: number; // Percentage of reorder level
  // Manufacturer-specific optional fields
  factoryAddress?: string;
  taxId?: string;
  productionLeadTime?: number;
  notifications?: {
    resourceChanges?: { email: boolean; sms: boolean };
    salesAlert?: { email: boolean; sms: boolean };
    loginFailAttempts?: { email: boolean; sms: boolean };
    systemUpdate?: { email: boolean; sms: boolean };
    returns?: { email: boolean; sms: boolean };
    lowStock?: { email: boolean; sms: boolean };
    userProfileChanges?: { email: boolean; sms: boolean };
  };
  setupCompletedAt: string;
}

export interface Business {
  id: string;
  _id?: string; // For backward compatibility with older business objects
  ownerId: string; // Reference to admin user who owns the business
  businessName: string;
  businessType: BusinessType;
  businessEmail?: {
    email: string;
    verified: boolean;
  };
  businessPhone?: {
    contact: string;
    verified: boolean;
  };
  businessAddress?: string; // Optional business address
  address?: string; // Optional business address (legacy)
  phone?: string; // Optional business phone (legacy)
  setupCompletedAt: string;
  settings: BusinessSettings; // New: embedded business settings
  user?: any; // Array of user IDs associated with this business
  activated?: boolean; // New: whether the business is activated via product key
  activationKey?: string; // New: the product key used for activation
  isDemoActivation?: boolean; // New: demo activation flag
  lastDemoResetAt?: Date | string; // New: last demo reset timestamp
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  _id?: string; // For backward compatibility with older user objects
  username: string;
  email?: string; // Optional email field
  password?: string; // hashed in production
  role: UserRole;
  businessId?: string; // Reference to Business model (optional during transition)
  branchId?: string | null;
  business?: Business | BusinessSetup; // Updated: can be either Business (with settings) or BusinessSetup
  createdAt?: string;
  token?: string; // For session management
  trial_expires?: string; // ISO date string when trial expires
  trial_days?: number; // Configured trial duration from server
  product_key_verified?: boolean; // Whether product key has been verified
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
  type?: "fixed" | "seasonal" | "automated"; // Default: 'fixed'
  safetyStock?: number; // Buffer stock
  leadTimeDays?: number; // Supplier lead time
  economicOrderQuantity?: number; // Optimal order size
}

export interface Product {
  // Core Fields (Required - existing)
  id?: string;
  _id?: string; // For backward compatibility with older product objects
  name: string;
  sku: string;
  category: string;
  customCategory?: string; // For "Other" category - user-defined category name
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
  status?: "active" | "discontinued"; // Default: 'active'
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
  imagePublicId?: string;
  image?: {
    url: string;
    public_id: string;
  };
  // Manufacturing fields
  isFinishedGood?: boolean;
  bom?: Array<{ componentId: string; quantity: number; unit?: string }>;
}

// Inventory Types
export interface StockMovement {
  id: string;
  _id?: string; // For backward compatibility with older movement objects
  productId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  reference: string; // Purchase order, Sales order, etc
  businessId?: string; // Business isolation (optional during transition)
  branchId?: string | null; // Branch-level scoping
  createdBy: string | User;
  createdAt?: string;
  notes?: string;
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
  id?: string;
  _id?: string; // For backward compatibility with older sale objects
  saleNumber: string;
  reference?: string;
  date: string;
  items: SaleItem[];
  totalAmount: number;
  status: "completed" | "returned";
  notes: string;
  businessId?: string; // Business isolation (optional during transition)
  branchId?: string | null; // Branch-level scoping
  createdBy: string | User;
  createdAt?: string;
  customerId?: string;
  customerName?: string;
  isCreditSale?: boolean;
  paymentType?: string;
  paymentStatus?: "pending" | "paid" | "partial" | "overdue";
  paidAmount?: number;
  txnId?: string;
  dueDate?: string;
  returnStatus?: "none" | "partial" | "returned"; // Track return status
  saleReturnId?: string; // Reference to associated sale return (if any)
}

export interface SaleItem {
  productId: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Sales Return Types
export interface SaleReturn {
  id?: string;
  _id?: string; // For backward compatibility with older return objects
  saleId: string; // Reference to the original sale
  items: SaleReturnItem[];
  totalAmount: number;
  reason?: string; // Reason for return (e.g., "Defective", "Wrong item", "Customer change of mind")
  notes?: string;
  status: "pending" | "completed" | "cancelled";
  businessId?: string; // Business isolation (optional during transition)
  branchId?: string | null; // Branch-level scoping
  createdBy: string;
  createdAt?: string;
  reference?: string; // Return reference number
  refundAmount?: number; // Amount refunded to customer
  refundMethod?: string; // Payment method used for refund
}

export interface SaleReturnItem {
  productId: string;
  quantity: number;
  unitPrice: number; // Unit price at time of return (may differ from sale price)
  total: number;
}

export type ActivityType =
  | "sale"
  | "stock"
  | "product"
  | "supplier"
  | "return"
  | "system"
  | "other";

export type ActivityAction = "create" | "update" | "delete" | "system_event";
export type ActivityStatus = "success" | "failed";

export interface ChangeLog {
  before?: Record<string, any>;
  after?: Record<string, any>;
  changedFields?: string[];
}

export interface Activity {
  id: string;
  _id?: string; // For backward compatibility with older activity objects
  type: ActivityType;
  action: ActivityAction; // create, update, delete, system_event
  status: ActivityStatus; // success or failed
  title: string;
  description: string;
  referenceId?: string; // Link to sale number, supplier id, product id, etc.
  entityType?:
    | "product"
    | "supplier"
    | "sale"
    | "stockMovement"
    | "return"
    | "other";
  entityId?: string;
  businessId?: string; // Business isolation (optional during transition)
  createdBy: string | User;
  metadata?: Record<string, any>;
  changeLog?: ChangeLog; // Before/after values for updates
  ipAddress?: string; // IP address of the request
  userAgent?: string; // User agent string
  resultingAction?: string; // Description of resulting change (e.g., "Stock updated from 100 to 95")
  createdAt: string;
}

export type SecurityEventType =
  | "login_success"
  | "login_failed"
  | "logout"
  | "session_expired"
  | "password_changed"
  | "password_reset_requested"
  | "password_reset_completed"
  | "profile_updated"
  | "profile_created"
  | "profile_deleted"
  | "role_changed"
  | "permissions_modified"
  | "mfa_enabled"
  | "mfa_disabled"
  | "session_started"
  | "account_locked";

export interface SecurityAudit {
  id?: string;
  _id?: string;
  eventType: SecurityEventType;
  userId?: string | User;
  targetUserId?: string | User;
  businessId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failed";
  reason?: string;
  resultingAction?: string;
  relatedActivityId?: string;
  createdAt: string;
  updatedAt?: string;
}

// Supplier Types
export interface Supplier {
  id?: string;
  _id?: string; // For backward compatibility with older supplier objects
  offline_id?: string; // Offline UUID for supplier
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
  // Offline product IDs (for products created offline, tracks offline_id references)
  offline_products?: string[];
  status?: "active" | "inactive" | "blocked";
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
    gender?: "mens" | "womens" | "unisex" | "kids";
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
  role: "admin" | "sales" | "accountant" | "manager";
  branchId?: string | null;
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
    customUnits?: string[]; // User-defined custom units
    deletedDefaults?: string[]; // Default units the user has deleted
  };
  notifications: {
    creationNotifications: {
      email: boolean;
      sms: boolean;
    };
    SalesNotifications: {
      email: boolean;
      sms: boolean;
    };
    stockNotifications: {
      email: boolean;
      sms: boolean;
    };
  };
  general: {
    companyName: string;
    contactEmail: string;
    theme: "light" | "dark";
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
  sync?: {
    offlineEnabled: boolean;
    syncInterval: string;
  };
}

// Notification Types
export type NotificationType =
  | "low_stock"
  | "stock_out"
  | "new_sale"
  | "new_product"
  | "data_sync"
  | "no_internet"
  | "credentials_change"
  | "admin_credentials_updated"
  | "resource_created"
  | "resource_updated"
  | "resource_deleted"
  | "user_profile_created"
  | "user_profile_updated"
  | "user_profile_deleted"
  | "info"
  | "success"
  | "error"
  | "warning";
export type NotificationPriority = "high" | "medium" | "low";

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
  saleReturns: SaleReturn[]; // Add sale returns tracking
  stockMovements: StockMovement[];
  activities: Activity[];
  securityAudits: SecurityAudit[];
  // settings removed - now handled by SettingsContext
}
