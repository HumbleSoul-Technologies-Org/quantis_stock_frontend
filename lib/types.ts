// Auth Types
export type UserRole = 'admin' | 'manager' | 'sales';

export interface User {
  id: string;
  username: string;
  password: string; // hashed in production
  role: UserRole;
  createdAt: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  costPrice: number;
  unit: string; // kg, lbs, units, etc
  supplierId: string;
  reorderLevel: number;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
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
