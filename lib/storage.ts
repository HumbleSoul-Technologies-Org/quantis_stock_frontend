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
  credentials: {
    teamUsers: [],
    passwordPolicy: {
      minLength: 8,
      requireMixedCase: true,
      requireNumbers: true,
      requireSpecialChars: false,
    },
    sessionTimeout: 30,
  },
};

const DEFAULT_USERS: User[] = [
  // Removed hardcoded demo users - authentication now handled by API
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

const DEFAULT_STATE: AppState = {
  users: DEFAULT_USERS,
  currentUser: null,
  products: [], // Start with empty array, load from API later
  suppliers: [], // Start with empty array, load from API later
  sales: [],
  stockMovements: [],
  settings: DEFAULT_SETTINGS,
};

class StorageService {
  // Check if localStorage is available and working
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Get browser compatibility info
  getBrowserCompatibility(): { localStorage: boolean; json: boolean; fetch: boolean } {
    const compatibility = {
      localStorage: this.isLocalStorageAvailable(),
      json: typeof JSON !== 'undefined',
      fetch: typeof fetch !== 'undefined',
    };

    if (!compatibility.localStorage) {
      console.warn('Browser compatibility issue: localStorage is not available');
    }
    if (!compatibility.json) {
      console.warn('Browser compatibility issue: JSON API is not available');
    }
    if (!compatibility.fetch) {
      console.warn('Browser compatibility issue: fetch API is not available');
    }

    return compatibility;
  }

  getState(): AppState {
    if (typeof window === 'undefined') {
      return DEFAULT_STATE;
    }

    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage is not available. Using default state.');
      return {
        users: [],
        currentUser: null,
        products: [],
        suppliers: [],
        sales: [],
        stockMovements: [],
        settings: DEFAULT_SETTINGS,
      };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Return empty state instead of initializing - only initialize after successful registration
        return {
          users: [],
          currentUser: null,
          products: [],
          suppliers: [],
          sales: [],
          stockMovements: [],
          settings: DEFAULT_SETTINGS,
        };
      }

      const parsed = JSON.parse(stored);
      // Ensure all required properties exist with defaults
      return {
        users: parsed.users || [],
        currentUser: parsed.currentUser || null,
        products: parsed.products || [],
        suppliers: parsed.suppliers || [],
        sales: parsed.sales || [],
        stockMovements: parsed.stockMovements || [],
        settings: {
          ...DEFAULT_SETTINGS,
          ...parsed.settings,
        },
      };
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return {
        users: [],
        currentUser: null,
        products: [],
        suppliers: [],
        sales: [],
        stockMovements: [],
        settings: DEFAULT_SETTINGS,
      };
    }
  }

  saveState(state: AppState): void {
    if (typeof window === 'undefined') return;
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage is not available. Cannot save state.');
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      // Try to clear some space if quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Attempting to clear old data.');
        try {
          // Clear the entire storage and try again
          localStorage.clear();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (retryError) {
          console.error('Failed to save even after clearing localStorage:', retryError);
        }
      }
    }
  }

  // Auth - DEPRECATED: Use API authentication instead
  login(username: string, password: string): User | null {
    const state = this.getState();

    // Only check team users created in Settings (for backward compatibility)
    const teamUsers = state.settings?.credentials?.teamUsers || [];
    const teamUser = teamUsers.find((u: any) => u.email === username && u.password === password);

    if (teamUser) {
      // Convert TeamUser to User format for login
      const user: User = {
        id: teamUser.id,
        username: teamUser.email, // Use email as username for team users
        password: teamUser.password,
        role: teamUser.role === 'accountant' ? 'manager' : (teamUser.role), // Map accountant → manager
        createdAt: teamUser.createdAt,
      };
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
    localStorage.removeItem(STORAGE_KEY);
    // localStorage.removeItem('erp_system_sync_queue');  
  }

  getCurrentUser(): User | null {
    return this.getState().currentUser;
  }

  updateUserCredentials(userId: string, newUsername: string, newPassword: string): boolean {
    const state = this.getState();
    const user = state.users.find((u) => u.id === userId || u._id === userId);
    if (user) {
      user.username = newUsername;
      user.password = newPassword;
      this.saveState(state);
      return true;
    }
    return false;
  }

  createUser(user: User): void {
    const state = this.getState();

    // If this is the first user, initialize the full state
    if (state.users.length === 0) {
      const initialState = {
        ...DEFAULT_STATE,
        users: [user],
        currentUser: user,
      };
      this.saveState(initialState);
    } else {
      state.users.push(user);
      this.saveState(state);
    }
  }

  getUsers(): User[] {
    return this.getState().users;
  }

  // Business Setup
  updateBusinessSetup(userId: string, businessSetup: any): boolean {
    const state = this.getState();
    const user = state.users.find((u) => u.id === userId || u._id === userId);
    if (user) {
      user.business = businessSetup;
      if (state.currentUser?.id === userId || state.currentUser?._id === userId) {
        state.currentUser = user;
      }
      this.saveState(state);
      return true;
    }
    return false;
  }

  getBusinessSetup(userId: string): any | null {
    const state = this.getState();
    const user = state.users.find((u) => u.id === userId || u._id === userId);
    return user?.business || null;
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
    const index = state.products.findIndex((p:any) => p.id === id || p._id === id);
    if (index !== -1) {
      state.products[index] = { ...state.products[index], ...product, updatedAt: new Date().toISOString() };
      this.saveState(state);
    }
  }

  deleteProduct(id: string): void {
    const state = this.getState();
    state.products = state.products.filter((p:any) => p.id !== id && p._id !== id);
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
    const index = state.suppliers.findIndex((s:any) => s.id === id || s._id === id);
    if (index !== -1) {
      state.suppliers[index] = { ...state.suppliers[index], ...supplier, updatedAt: new Date().toISOString() };
      this.saveState(state);
    }
  }

  deleteSupplier(id: string): void {
    const state = this.getState();
    state.suppliers = state.suppliers.filter((s:any) => s.id !== id && s._id !== id);
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
      const product = state.products.find((p:any) => p.id === item.productId || p._id === item.productId);
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
    const index = state.sales.findIndex((s) => s.id === id || s._id === id);
    if (index !== -1) {
      state.sales[index] = { ...state.sales[index], ...sale };
      this.saveState(state);
    }
  }

  deleteSale(id: string): void {
    const state = this.getState();
    state.sales = state.sales.filter((s) => s.id !== id && s._id !== id);
    this.saveState(state);
  }

  // Stock Movements
  getStockMovements(): StockMovement[] {
    return this.getState().stockMovements;
  }

  addStockMovement(movement: StockMovement): void {
    const state = this.getState();
    state.stockMovements.push(movement);

    // Update product stock (support id and _id from various data sources)
    const product = state.products.find(
      (p:any) => p.id === movement.productId || p._id === movement.productId,
    );
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
    // Deep merge for nested objects
    const updatedCredentials = settings.credentials
      ? {
          ...state.settings.credentials,
          ...settings.credentials,
          passwordPolicy: settings.credentials.passwordPolicy
            ? { ...state.settings.credentials.passwordPolicy, ...settings.credentials.passwordPolicy }
            : state.settings.credentials.passwordPolicy,
        }
      : state.settings.credentials;

    state.settings = {
      ...state.settings,
      ...settings,
      currency: { ...state.settings.currency, ...settings.currency },
      units: { ...state.settings.units, ...settings.units },
      notifications: { ...state.settings.notifications, ...settings.notifications },
      general: { ...state.settings.general, ...settings.general },
      credentials: updatedCredentials,
    };
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
