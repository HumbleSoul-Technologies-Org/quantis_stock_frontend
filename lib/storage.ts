import { AppState, User, Product, Supplier, Sale, StockMovement, AppSettings } from './types';
import { useQuery } from '@tanstack/react-query';
import { use, useEffect, useState } from 'react';
import { apiRequest } from './queryClient';

 
  

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

 
const apiSuppliers = async (token?: string) => {
  
  // GET request with query parameters
  try {
    const response = await apiRequest('GET', '/suppliers/all', {
      limit: 20,
      status: 'active'
    }, token);

    if (response.ok) {
      const data = await response.json();
      return data || [];
    }
  } catch (error) {
    console.warn('Failed to fetch default suppliers from API:', error);
  }
  return [];
}


const apiInventory = async (token?: string) => {
  
  // GET request with query parameters
  try {
    const response = await apiRequest('GET', '/inventory/movements', {
      limit: 100,
      status: 'active'
    }, token);

    if (response.ok) {
      const data = await response.json();
      
      // Return the movements array or empty array
      return (data && data.movements) || data || [];
    }
  } catch (error) {
    console.warn('Failed to fetch inventory movements from API:', error);
  }
  return [];
}
const apiProducts = async (token?: string) => {
  
  // GET request with query parameters
  try {
    const response = await apiRequest('GET', '/products/all', {
      limit: 20,
      status: 'active'
    }, token);

    if (response.ok) {
      const data = await response.json();
      
      return data || [];
    }
  } catch (error) {
    console.warn('Failed to fetch default suppliers from API:', error);
  }
  return [];
}

 

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
        businessSetup: undefined, // Team users join existing business, so setup is complete
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

  createUser(user: User): void {
    const state = this.getState();
    state.users.push(user);
    this.saveState(state);
  }

  getUsers(): User[] {
    return this.getState().users;
  }

  // Business Setup
  updateBusinessSetup(userId: string, businessSetup: any): boolean {
    const state = this.getState();
    const user = state.users.find((u) => u.id === userId);
    if (user) {
      user.businessSetup = businessSetup;
      if (state.currentUser?.id === userId) {
        state.currentUser = user;
      }
      this.saveState(state);
      return true;
    }
    return false;
  }

  getBusinessSetup(userId: string): any | null {
    const state = this.getState();
    const user = state.users.find((u) => u.id === userId);
    return user?.businessSetup || null;
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
    const index = state.products.findIndex((p:any) => p.id === id);
    if (index !== -1) {
      state.products[index] = { ...state.products[index], ...product, updatedAt: new Date().toISOString() };
      this.saveState(state);
    }
  }

  deleteProduct(id: string): void {
    const state = this.getState();
    state.products = state.products.filter((p:any) => p.id !== id);
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
    const index = state.suppliers.findIndex((s:any) => s.id === id);
    if (index !== -1) {
      state.suppliers[index] = { ...state.suppliers[index], ...supplier, updatedAt: new Date().toISOString() };
      this.saveState(state);
    }
  }

  deleteSupplier(id: string): void {
    const state = this.getState();
    state.suppliers = state.suppliers.filter((s:any) => s.id !== id);
    this.saveState(state);
  }

  // Load suppliers from API and set as defaults
  async loadSuppliersFromAPI(token?: string): Promise<void> {
    try {
      const suppliers = await apiSuppliers(token);
      if (suppliers && suppliers.length > 0) {
        const state = this.getState();
        state.suppliers = suppliers;
        this.saveState(state);
      }
    } catch (error) {
      console.warn('Failed to load suppliers from API:', error);
    }
  }

  
  // Load products from API and set as defaults
  async loadProductsFromAPI(): Promise<void> {
    try {
      const products = await apiProducts();
      if (products && products.length > 0) {
        const state = this.getState();
        state.products = products;
        this.saveState(state);
      }
    } catch (error) {
      console.warn('Failed to load products from API:', error);
    }
  }

  // Load inventory movements from API and set as defaults
  async loadInventoryFromAPI(token?: string): Promise<void> {
    try {
      const movements = await apiInventory(token);
      if (movements && movements.length > 0) {
        const state = this.getState();
        state.stockMovements = movements;
        this.saveState(state);
      }
    } catch (error) {
      console.warn('Failed to load inventory movements from API:', error);
    }
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
      const product = state.products.find((p:any) => p.id === item.productId);
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
