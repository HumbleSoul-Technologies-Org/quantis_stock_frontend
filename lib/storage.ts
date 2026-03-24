import { AppState, User, Product, Supplier, Sale, StockMovement, AppSettings } from './types';

const STORAGE_KEY = 'erp_system_state';
const DEFAULT_SETTINGS: AppSettings = {
  currency: {
    symbol: '$',
    code: 'USD',
    decimalPlaces: 2,
  },
  units: {
    weight: 'kg',
    volume: 'L',
    count: 'units',
  },
  notifications: {
    emailAlerts: true,
    smsAlerts: false,
    lowStockAlerts: true,
    saleNotifications: true,
  },
  general: {
    companyName: 'My Stock Manager',
    contactEmail: 'contact@company.com',
    theme: 'light',
  },
};

const DEFAULT_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123', // In production, this would be hashed
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'manager',
    password: 'manager123',
    role: 'manager',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    username: 'sales',
    password: 'sales123',
    role: 'sales',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Laptop Computer',
    sku: 'LAP-001',
    category: 'Electronics',
    unitPrice: 1200,
    costPrice: 800,
    unit: 'units',
    supplierId: '1',
    reorderLevel: 5,
    currentStock: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    sku: 'MOU-001',
    category: 'Accessories',
    unitPrice: 25,
    costPrice: 12,
    unit: 'units',
    supplierId: '1',
    reorderLevel: 50,
    currentStock: 120,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'USB-C Cable',
    sku: 'CAB-001',
    category: 'Cables',
    unitPrice: 15,
    costPrice: 5,
    unit: 'units',
    supplierId: '2',
    reorderLevel: 100,
    currentStock: 250,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Mechanical Keyboard',
    sku: 'KEY-001',
    category: 'Accessories',
    unitPrice: 150,
    costPrice: 75,
    unit: 'units',
    supplierId: '1',
    reorderLevel: 10,
    currentStock: 32,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: '1',
    name: 'Tech World Supplies',
    email: 'orders@techworld.com',
    phone: '+1-800-123-4567',
    address: '123 Tech Avenue',
    city: 'San Francisco',
    country: 'USA',
    paymentTerms: 'Net 30',
    website: 'https://techworld.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Global Electronics Ltd',
    email: 'sales@globalelec.com',
    phone: '+44-20-7946-0958',
    address: '456 Electronics Street',
    city: 'London',
    country: 'UK',
    paymentTerms: 'Net 45',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_STATE: AppState = {
  users: DEFAULT_USERS,
  currentUser: null,
  products: DEFAULT_PRODUCTS,
  suppliers: DEFAULT_SUPPLIERS,
  sales: [],
  stockMovements: [],
  settings: DEFAULT_SETTINGS,
};

class StorageService {
  private getState(): AppState {
    if (typeof window === 'undefined') {
      return DEFAULT_STATE;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const initialState = DEFAULT_STATE;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
      return initialState;
    }

    return JSON.parse(stored);
  }

  private saveState(state: AppState): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // Auth
  login(username: string, password: string): User | null {
    const state = this.getState();
    const user = state.users.find((u) => u.username === username && u.password === password);
    if (user) {
      state.currentUser = user;
      this.saveState(state);
      return user;
    }
    return null;
  }

  logout(): void {
    const state = this.getState();
    state.currentUser = null;
    this.saveState(state);
  }

  getCurrentUser(): User | null {
    return this.getState().currentUser;
  }

  updateUserCredentials(userId: string, newUsername: string, newPassword: string): boolean {
    const state = this.getState();
    const user = state.users.find((u) => u.id === userId);
    if (user) {
      user.username = newUsername;
      user.password = newPassword;
      this.saveState(state);
      return true;
    }
    return false;
  }

  // Products
  getProducts(): Product[] {
    return this.getState().products;
  }

  addProduct(product: Product): void {
    const state = this.getState();
    state.products.push(product);
    this.saveState(state);
  }

  updateProduct(id: string, product: Partial<Product>): void {
    const state = this.getState();
    const index = state.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      state.products[index] = { ...state.products[index], ...product, updatedAt: new Date().toISOString() };
      this.saveState(state);
    }
  }

  deleteProduct(id: string): void {
    const state = this.getState();
    state.products = state.products.filter((p) => p.id !== id);
    this.saveState(state);
  }

  // Suppliers
  getSuppliers(): Supplier[] {
    return this.getState().suppliers;
  }

  addSupplier(supplier: Supplier): void {
    const state = this.getState();
    state.suppliers.push(supplier);
    this.saveState(state);
  }

  updateSupplier(id: string, supplier: Partial<Supplier>): void {
    const state = this.getState();
    const index = state.suppliers.findIndex((s) => s.id === id);
    if (index !== -1) {
      state.suppliers[index] = { ...state.suppliers[index], ...supplier, updatedAt: new Date().toISOString() };
      this.saveState(state);
    }
  }

  deleteSupplier(id: string): void {
    const state = this.getState();
    state.suppliers = state.suppliers.filter((s) => s.id !== id);
    this.saveState(state);
  }

  // Sales
  getSales(): Sale[] {
    return this.getState().sales;
  }

  addSale(sale: Sale): void {
    const state = this.getState();
    state.sales.push(sale);

    // Deduct from stock
    sale.items.forEach((item) => {
      const product = state.products.find((p) => p.id === item.productId);
      if (product) {
        product.currentStock -= item.quantity;

        // Add stock movement
        const movement: StockMovement = {
          id: Math.random().toString(36).substr(2, 9),
          productId: item.productId,
          type: 'out',
          quantity: item.quantity,
          reason: 'Sale',
          reference: sale.saleNumber,
          createdBy: state.currentUser?.id || 'system',
          createdAt: new Date().toISOString(),
        };
        state.stockMovements.push(movement);
      }
    });

    this.saveState(state);
  }

  updateSale(id: string, sale: Partial<Sale>): void {
    const state = this.getState();
    const index = state.sales.findIndex((s) => s.id === id);
    if (index !== -1) {
      state.sales[index] = { ...state.sales[index], ...sale };
      this.saveState(state);
    }
  }

  deleteSale(id: string): void {
    const state = this.getState();
    state.sales = state.sales.filter((s) => s.id !== id);
    this.saveState(state);
  }

  // Stock Movements
  getStockMovements(): StockMovement[] {
    return this.getState().stockMovements;
  }

  addStockMovement(movement: StockMovement): void {
    const state = this.getState();
    state.stockMovements.push(movement);

    // Update product stock
    const product = state.products.find((p) => p.id === movement.productId);
    if (product) {
      if (movement.type === 'in') {
        product.currentStock += movement.quantity;
      } else if (movement.type === 'out') {
        product.currentStock -= movement.quantity;
      } else if (movement.type === 'adjustment') {
        product.currentStock = movement.quantity;
      }
    }

    this.saveState(state);
  }

  // Settings
  getSettings(): AppSettings {
    return this.getState().settings;
  }

  updateSettings(settings: Partial<AppSettings>): void {
    const state = this.getState();
    state.settings = { ...state.settings, ...settings };
    this.saveState(state);
  }

  // Reset
  resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEY);
    const initialState = DEFAULT_STATE;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
  }
}

export const storage = new StorageService();
