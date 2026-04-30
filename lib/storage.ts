import { AppState, User, Product, Supplier, Sale, SaleReturn, StockMovement } from './types';

const STORAGE_KEY = 'erp_system_state';
const OFFLINE_ITEMS_KEY = 'erp_system_offline_items';
const MERGED_CACHE_KEY = 'erp_system_merged_cache';

const DEFAULT_USERS: User[] = [
  // Removed hardcoded demo users - authentication now handled by API
];

// Offline-only items that haven't synced yet
interface OfflineItemsState {
  products: Product[];
  suppliers: Supplier[];
  sales: Sale[];
  saleReturns: SaleReturn[];
  stockMovements: StockMovement[];
}

const DEFAULT_OFFLINE_STATE: OfflineItemsState = {
  products: [],
  suppliers: [],
  sales: [],
  saleReturns: [],
  stockMovements: [],
};
 
const DEFAULT_STATE: AppState = {
  users: DEFAULT_USERS,
  currentUser: null,
  products: [], // Start with empty array, load from API later
  suppliers: [], // Start with empty array, load from API later
  sales: [],
  saleReturns: [], // Add sale returns tracking
  stockMovements: [],
  // settings removed - now handled by SettingsContext
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
        saleReturns: [],
        stockMovements: [],
        // settings removed - now handled by SettingsContext
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
          saleReturns: [],
          stockMovements: [],
          // settings removed - now handled by SettingsContext
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
        saleReturns: parsed.saleReturns || [], // Add sale returns tracking
        stockMovements: parsed.stockMovements || [],
        // settings removed - now handled by SettingsContext
      };
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return {
        users: [],
        currentUser: null,
        products: [],
        suppliers: [],
        sales: [],
        saleReturns: [], // Add sale returns tracking
        stockMovements: [],
        // settings removed - now handled by SettingsContext
      };
    }
  }

  private matchesAnyId(item: any, id: string | undefined): boolean {
    return (
      !!id &&
      (item.id === id || item._id === id || item.offline_id === id)
    );
  }

  private matchesReferenceId(item: any, id: string | undefined): boolean {
    if (!id) return false;
    return (
      this.matchesAnyId(item, id) ||
      item.offline_product_id === id ||
      item.offline_supplier_id === id ||
      item.offline_sale_id === id
    );
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
        console.warn('localStorage quota exceeded. Clearing only regular state to preserve offline items.');
        try {
          // Only remove regular state, preserve offline items and other keys
          localStorage.removeItem(STORAGE_KEY);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          console.log('✅ [STORAGE] Successfully saved after removing old state, offline items preserved');
        } catch (retryError) {
          console.error('Failed to save even after clearing regular state:', retryError);
        }
      }
    }
  }

  getMergedCache(): AppState {
    if (typeof window === 'undefined') {
      return DEFAULT_STATE;
    }

    if (!this.isLocalStorageAvailable()) {
      return DEFAULT_STATE;
    }

    try {
      const stored = localStorage.getItem(MERGED_CACHE_KEY);
      if (!stored) {
        return DEFAULT_STATE;
      }

      const parsed = JSON.parse(stored);
      return {
        users: parsed.users || [],
        currentUser: parsed.currentUser || null,
        products: parsed.products || [],
        suppliers: parsed.suppliers || [],
        sales: parsed.sales || [],
        saleReturns: parsed.saleReturns || [],
        stockMovements: parsed.stockMovements || [],
      };
    } catch (error) {
      console.error('Error reading merged cache from localStorage:', error);
      return DEFAULT_STATE;
    }
  }

  saveMergedCache(state: Partial<AppState>): void {
    if (typeof window === 'undefined') return;
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage is not available. Cannot save merged cache.');
      return;
    }

    try {
      const currentCache = this.getMergedCache();
      const mergedCache = {
        ...currentCache,
        ...state,
      };
      localStorage.setItem(MERGED_CACHE_KEY, JSON.stringify(mergedCache));
    } catch (error) {
      console.error('Error saving merged cache to localStorage:', error);
    }
  }

  // Auth - DEPRECATED: Use API authentication instead
  login(username: string, password: string): User | null {
    const state = this.getState();

    // Only check team users created in Settings (for backward compatibility)
    const teamUsers: any[] = []; // Settings moved to separate context
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
    const index = state.products.findIndex((p:any) => this.matchesAnyId(p, id));
    if (index !== -1) {
      state.products[index] = { ...state.products[index], ...product, updatedAt: new Date().toISOString() };
      this.saveState(state);
    }
  }

  deleteProduct(id: string): void {
    const state = this.getState();
    state.products = state.products.filter((p:any) => !this.matchesAnyId(p, id));
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
    const index = state.suppliers.findIndex((s:any) => this.matchesAnyId(s, id));
    if (index !== -1) {
      state.suppliers[index] = { ...state.suppliers[index], ...supplier, updatedAt: new Date().toISOString() };
      this.saveState(state);
    }
  }

  deleteSupplier(id: string): void {
    const state = this.getState();
    state.suppliers = state.suppliers.filter((s:any) => !this.matchesAnyId(s, id));
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
      const product = state.products.find(
        (p:any) =>
          p.id === item.productId ||
          p._id === item.productId ||
          p.offline_id === item.productId ||
          p.id === item.offline_product_id ||
          p._id === item.offline_product_id ||
          p.offline_id === item.offline_product_id,
      );
      if (product) {
        product.currentStock -= item.quantity;

        // Add stock movement
        const movement: StockMovement = {
          id: Math.random().toString(36).substr(2, 9),
          productId: product.id || product._id || item.productId,
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
    const index = state.sales.findIndex(
      (s) => s.id === id || s._id === id || s.offline_id === id,
    );
    if (index !== -1) {
      state.sales[index] = { ...state.sales[index], ...sale };
      this.saveState(state);
    }
  }

  deleteSale(id: string): void {
    const state = this.getState();
    state.sales = state.sales.filter((s) => !this.matchesAnyId(s, id));
    this.saveState(state);
  }

  // Sale Returns
  getSaleReturns(): SaleReturn[] {
    return this.getState().saleReturns;
  }

  processSaleReturn(saleReturn: SaleReturn): void {
    const state = this.getState();
    
    // Find the original sale to validate return quantities
    const originalSale = state.sales.find(
      (s) =>
        this.matchesAnyId(s, saleReturn.saleId) ||
        this.matchesAnyId(s, saleReturn.offline_sale_id),
    );
    if (!originalSale) {
      throw new Error(`Original sale ${saleReturn.saleId || saleReturn.offline_sale_id} not found`);
    }

    // Validate return quantities don't exceed sold quantities
    saleReturn.items.forEach((returnItem) => {
      const originalItem = originalSale.items.find((item) => item.productId === returnItem.productId);
      if (!originalItem) {
        throw new Error(`Product ${returnItem.productId} was not part of the original sale`);
      }
      if (returnItem.quantity > originalItem.quantity) {
        throw new Error(`Cannot return more than ${originalItem.quantity} units of product ${returnItem.productId}`);
      }
    });

    // Add the return record
    state.saleReturns.push(saleReturn);

    // Update product stock and create stock movements
    saleReturn.items.forEach((item) => {
      const product = state.products.find(
        (p:any) =>
          p.id === item.productId ||
          p._id === item.productId ||
          p.offline_id === item.productId ||
          p.id === item.offline_product_id ||
          p._id === item.offline_product_id ||
          p.offline_id === item.offline_product_id,
      );
      if (product) {
        product.currentStock += item.quantity;

        // Add stock movement for return
        const movement: StockMovement = {
          id: Math.random().toString(36).substr(2, 9),
          productId: product.id || product._id || item.productId,
          type: 'in',
          quantity: item.quantity,
          reason: 'Return',
          reference: saleReturn.reference || originalSale.saleNumber,
          createdBy: state.currentUser?.id || 'system',
          createdAt: new Date().toISOString(),
        };
        state.stockMovements.push(movement);
      }
    });

    // Update sale return status
    const totalReturnedQuantity = saleReturn.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalSoldQuantity = originalSale.items.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalReturnedQuantity >= totalSoldQuantity) {
      originalSale.returnStatus = 'returned';
    } else {
      originalSale.returnStatus = 'partial';
    }

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
      (p:any) => this.matchesReferenceId(p, movement.productId),
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

  // ============ Offline-Only Items Store ============
  // Track items created offline that haven't synced yet

  private getOfflineState(): OfflineItemsState {
    if (typeof window === 'undefined') {
      return DEFAULT_OFFLINE_STATE;
    }

    if (!this.isLocalStorageAvailable()) {
      return DEFAULT_OFFLINE_STATE;
    }

    try {
      const stored = localStorage.getItem(OFFLINE_ITEMS_KEY);
      if (!stored) {
        return DEFAULT_OFFLINE_STATE;
      }

      const parsed = JSON.parse(stored);
      return {
        products: parsed.products || [],
        suppliers: parsed.suppliers || [],
        sales: parsed.sales || [],
        saleReturns: parsed.saleReturns || [],
        stockMovements: parsed.stockMovements || [],
      };
    } catch (error) {
      console.error('Error reading offline items from localStorage:', error);
      return DEFAULT_OFFLINE_STATE;
    }
  }

  private saveOfflineState(state: OfflineItemsState): void {
    if (typeof window === 'undefined') return;
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage is not available. Cannot save offline items.');
      return;
    }

    try {
      localStorage.setItem(OFFLINE_ITEMS_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving offline items to localStorage:', error);
    }
  }

  getOfflineItems(): OfflineItemsState {
    return this.getOfflineState();
  }

  addOfflineProduct(product: Product): void {
    const state = this.getOfflineState();
    state.products.push(product);
    this.saveOfflineState(state);
  }

  addOfflineSupplier(supplier: Supplier): void {
    const state = this.getOfflineState();
    state.suppliers.push(supplier);
    this.saveOfflineState(state);
  }

  addOfflineSale(sale: Sale): void {
    const state = this.getOfflineState();
    state.sales.push(sale);
    this.saveOfflineState(state);
  }

  addOfflineSaleReturn(saleReturn: SaleReturn): void {
    const state = this.getOfflineState();
    state.saleReturns.push(saleReturn);
    this.saveOfflineState(state);
  }

  addOfflineStockMovement(movement: StockMovement): void {
    const state = this.getOfflineState();
    state.stockMovements.push(movement);
    this.saveOfflineState(state);
  }

  removeOfflineItem(type: 'product' | 'supplier' | 'sale' | 'saleReturn' | 'stockMovement', id: string): void {
    const state = this.getOfflineState();
    
    const matchesId = (item: any) =>
      item.id === id || item._id === id || item.offline_id === id;

    switch (type) {
      case 'product':
        state.products = state.products.filter((p: any) => !matchesId(p));
        break;
      case 'supplier':
        state.suppliers = state.suppliers.filter((s: any) => !matchesId(s));
        break;
      case 'sale':
        state.sales = state.sales.filter((s: any) => !matchesId(s));
        break;
      case 'saleReturn':
        state.saleReturns = state.saleReturns.filter((sr: any) => !matchesId(sr));
        break;
      case 'stockMovement':
        state.stockMovements = state.stockMovements.filter((m: any) => !matchesId(m));
        break;
    }
    
    this.saveOfflineState(state);
  }

  clearOfflineItems(): void {
    if (typeof window === 'undefined') return;
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(OFFLINE_ITEMS_KEY);
    } catch (error) {
      console.error('Error clearing offline items:', error);
    }
  }

  // Reset
  resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OFFLINE_ITEMS_KEY);
    const initialState = DEFAULT_STATE;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
  }

}

export const storage = new StorageService();
