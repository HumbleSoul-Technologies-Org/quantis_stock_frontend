"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Activity,
  ActivityType,
  SecurityAudit,
  SecurityEventType,
  User,
  Product,
  Supplier,
  Sale,
  SaleItem,
  SaleReturn,
  StockMovement,
} from "@/lib/types";
import { storage } from "@/lib/storage";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/useToast";

const normalizeCollectionPayload = (payload: unknown, fallbackKey?: string) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const data = payload as Record<string, unknown>;

  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.products)) return data.products;
  if (Array.isArray(data.sales)) return data.sales;
  if (Array.isArray(data.movements)) return data.movements;
  if (Array.isArray(data.returns)) return data.returns;
  if (Array.isArray(data.activities)) return data.activities;
  if (Array.isArray(data.audits)) return data.audits;

  if (
    fallbackKey &&
    Array.isArray((data as Record<string, unknown>)[fallbackKey])
  ) {
    return (data as Record<string, unknown>)[fallbackKey] as unknown[];
  }

  return [];
};

// API functions for polling
const apiSuppliers = async (token?: string, businessId?: string) => {
  try {
    const response = await apiRequest(
      "GET",
      `/suppliers/all`,
      businessId ? { businessId } : {},
      token,
    );

    if (response.ok) {
      const data = await response.json();
      return normalizeCollectionPayload(data);
    }
  } catch (error) {
    console.warn("Failed to fetch suppliers from API:", error);
  }
  return null;
};

const apiProducts = async (token?: string, businessId?: string) => {
  try {
    const response = await apiRequest(
      "GET",
      "/products/all",
      {
        limit: 20,
        status: "active",
        ...(businessId ? { businessId } : {}),
      },
      token,
    );

    if (response.ok) {
      const data = await response.json();
      return normalizeCollectionPayload(data, "products");
    }
  } catch (error) {
    console.warn("Failed to fetch products from API:", error);
  }
  return null;
};

const apiInventory = async (token?: string, businessId?: string) => {
  try {
    const response = await apiRequest(
      "GET",
      "/inventory/movements",
      {
        limit: 100,
        status: "active",
        ...(businessId ? { businessId } : {}),
      },
      token,
    );

    if (response.ok) {
      const data = await response.json();
      return normalizeCollectionPayload(data, "movements");
    }
  } catch (error) {
    console.warn("Failed to fetch inventory movements from API:", error);
  }
  return null;
};

const apiSales = async (token?: string, businessId?: string) => {
  try {
    const response = await apiRequest(
      "GET",
      "/sales/all",
      {
        limit: 100,
        status: "active",
        ...(businessId ? { businessId } : {}),
      },
      token,
    );

    if (response.ok) {
      const data = await response.json();
      return normalizeCollectionPayload(data, "sales");
    }
  } catch (error) {
    console.warn("Failed to fetch sales from API:", error);
  }
  return null;
};

const apiSaleReturns = async (token?: string, businessId?: string) => {
  try {
    const response = await apiRequest(
      "GET",
      "/sales/returns/all",
      {
        limit: 100,
        status: "all",
        ...(businessId ? { businessId } : {}),
      },
      token,
    );

    if (response.ok) {
      const data = await response.json();
      return normalizeCollectionPayload(data, "returns");
    }
  } catch (error) {
    console.warn("Failed to fetch sale returns from API:", error);
  }
  return null;
};

interface DataContextType {
  // Products
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => void;

  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Supplier) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  // Sales
  sales: Sale[];
  addSale: (sale: Sale) => Promise<void>;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  processSaleReturn: (saleReturn: SaleReturn) => Promise<void>;

  // Sales Returns
  saleReturns: SaleReturn[];
  getSaleReturns: () => SaleReturn[];
  getSaleReturnById: (id: string) => SaleReturn | undefined;
  refetchSaleReturns: () => Promise<any>;

  // Stock Movements
  stockMovements: StockMovement[];
  addStockMovement: (movement: StockMovement) => void;

  // Activities
  activities: Activity[];
  addActivity: (activity: Activity) => Promise<void>;
  refetchActivities: () => Promise<any>;
  logActivity: (
    activity: Omit<Activity, "id" | "createdAt">,
  ) => Promise<Activity>;

  // Activity Filtering Utilities
  getActivitiesByType: (entityType: string) => Activity[];
  getActivitiesByEntity: (entityId: string) => Activity[];
  getActivitiesByUser: (userId: string) => Activity[];
  getActivitiesByAction: (action: string) => Activity[];
  getActivitiesByDateRange: (startDate: Date, endDate: Date) => Activity[];
  getActivitiesByStatus: (status: string) => Activity[];
  searchActivities: (query: string) => Activity[];
  getActivitiesWithFilters: (filters: {
    entityType?: string;
    entityId?: string;
    userId?: string;
    action?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    searchQuery?: string;
  }) => Activity[];

  // Security Audits
  securityAudits: SecurityAudit[];
  refetchSecurityAudits: () => Promise<any>;

  // Utilities
  getProductById: (id: string) => Product | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
  getSalesForUser: (userId: string) => Sale[];
  getProductStockHistory: (productId: string) => StockMovement[];
  refresh: () => void;
  refetchData: () => Promise<void>;
  refetchProducts: () => Promise<any>;
  refetchInventory: () => Promise<any>;

  // Loading states for skeleton loaders
  isInitialLoadingProducts: boolean;
  isInitialLoadingSuppliers: boolean;
  isInitialLoadingSales: boolean;
  isInitialLoadingInventory: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { error: toastError } = useToast();
  const activeBusinessId =
    user?.businessId ||
    (user as any)?.business?._id ||
    (user as any)?.business?.id ||
    (user as any)?.business?.businessId ||
    undefined;

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleReturns, setSaleReturns] = useState<SaleReturn[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [securityAudits, setSecurityAudits] = useState<SecurityAudit[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial loading states for skeleton loaders
  const [isInitialLoadingProducts, setIsInitialLoadingProducts] =
    useState(true);
  const [isInitialLoadingSuppliers, setIsInitialLoadingSuppliers] =
    useState(true);
  const [isInitialLoadingSales, setIsInitialLoadingSales] = useState(true);
  const [isInitialLoadingInventory, setIsInitialLoadingInventory] =
    useState(true);

  const sendApiRequest = useCallback(
    async (method: string, endpoint: string, payload?: unknown) => {
      try {
        const response = await apiRequest(
          method,
          endpoint,
          payload,
          user?.token,
        );
        return response;
      } catch (error: any) {
        console.error("[DATACONTEXT] API request failed", endpoint, error);
        const isRateLimitError =
          error?.status === 429 ||
          error?.message?.includes("API request limit exceeded") ||
          error?.message?.startsWith("429:");

        toastError(
          isRateLimitError
            ? "Too many requests. Retrying automatically, please try again in a few seconds."
            : error?.message ||
                "Unable to sync with server. Please refresh and try again.",
          5000,
        );
        throw error;
      }
    },
    [toastError, user?.token],
  );

  const persistSuppliers = useCallback(
    (updatedSuppliers: Supplier[]) => {
      setSuppliers(updatedSuppliers);
      const state = storage.getState();
      state.suppliers = updatedSuppliers;
      storage.saveState(state);
      queryClient.setQueryData(
        ["suppliers", activeBusinessId],
        updatedSuppliers,
      );
    },
    [activeBusinessId],
  );

  const persistProducts = useCallback(
    (updatedProducts: Product[]) => {
      setProducts(updatedProducts);
      const state = storage.getState();
      state.products = updatedProducts;
      storage.saveState(state);
      queryClient.setQueryData(["products", activeBusinessId], updatedProducts);
    },
    [activeBusinessId],
  );

  const persistSales = useCallback(
    (updatedSales: Sale[]) => {
      setSales(updatedSales);
      const state = storage.getState();
      state.sales = updatedSales;
      storage.saveState(state);
      queryClient.setQueryData(["sales", activeBusinessId], updatedSales);
    },
    [activeBusinessId],
  );

  const persistSaleReturns = useCallback(
    (updatedSaleReturns: SaleReturn[]) => {
      setSaleReturns(updatedSaleReturns);
      const state = storage.getState();
      state.saleReturns = updatedSaleReturns;
      storage.saveState(state);
      queryClient.setQueryData(
        ["sales", "returns", activeBusinessId],
        updatedSaleReturns,
      );
    },
    [activeBusinessId],
  );

  const persistStockMovements = useCallback(
    (updatedStockMovements: StockMovement[]) => {
      setStockMovements(updatedStockMovements);
      const state = storage.getState();
      state.stockMovements = updatedStockMovements;
      storage.saveState(state);
      queryClient.setQueryData(
        ["inventory", "movements", activeBusinessId],
        updatedStockMovements,
      );
    },
    [activeBusinessId],
  );

  const persistActivities = useCallback(
    (updatedActivities: Activity[]) => {
      setActivities(updatedActivities);
      const state = storage.getState();
      state.activities = updatedActivities;
      storage.saveState(state);
      queryClient.setQueryData(
        ["activities", activeBusinessId],
        updatedActivities,
      );
    },
    [activeBusinessId],
  );

  const persistSecurityAudits = useCallback(
    (updatedAudits: SecurityAudit[]) => {
      setSecurityAudits(updatedAudits);
      const state = storage.getState();
      state.securityAudits = updatedAudits;
      storage.saveState(state);
      queryClient.setQueryData(["security-audits", user?.id], updatedAudits);
    },
    [user?.id],
  );

  const apiActivities = async (token?: string, businessId?: string) => {
    try {
      const response = await apiRequest(
        "GET",
        "/activities/recent",
        {
          limit: 20,
          ...(businessId ? { businessId } : {}),
        },
        token,
      );

      if (response.ok) {
        const data = await response.json();
        return data?.activities || data || [];
      }
    } catch (error) {
      console.warn("Failed to fetch activities from API:", error);
    }

    return [];
  };

  const apiSecurityAudits = async (token?: string, userId?: string) => {
    try {
      const response = await apiRequest(
        "GET",
        "/security-audits",
        {
          limit: 50,
        },
        token,
      );

      if (response.ok) {
        const data = await response.json();
        return data?.audits || data || [];
      }
    } catch (error) {
      console.warn("Failed to fetch security audits from API:", error);
    }

    return [];
  };

  // No Internet modal fallback stub for online-only mode
  // Helper to resolve reference IDs: use server ID if available
  const resolveReferenceId = useCallback((item: any): string | undefined => {
    if (!item) return undefined;
    // Use server ID (real MongoDB ID)
    if (item.id) return item.id;
    if (item._id) return item._id;
    return undefined;
  }, []);

  const refresh = useCallback(() => {
    const state = storage.getState();

    setProducts(Array.isArray(state.products) ? state.products : []);
    setSuppliers(Array.isArray(state.suppliers) ? state.suppliers : []);
    setSales(Array.isArray(state.sales) ? state.sales : []);
    setSaleReturns(Array.isArray(state.saleReturns) ? state.saleReturns : []);
    setStockMovements(
      Array.isArray(state.stockMovements) ? state.stockMovements : [],
    );
    setActivities(Array.isArray(state.activities) ? state.activities : []);
    setSecurityAudits(
      Array.isArray(state.securityAudits) ? state.securityAudits : [],
    );
  }, []);

  // Initialize encrypted storage on mount
  useEffect(() => {
    const initializeStorage = async () => {
      await storage.initialize();
      console.log("[DATACONTEXT] Encrypted storage initialized");
    };
    initializeStorage();
  }, []);

  // Initialize from storage on mount
  useEffect(() => {
    const loadData = () => {
      const state = storage.getState();

      setProducts(Array.isArray(state.products) ? state.products : []);
      setSuppliers(Array.isArray(state.suppliers) ? state.suppliers : []);
      setSales(Array.isArray(state.sales) ? state.sales : []);
      setSaleReturns(Array.isArray(state.saleReturns) ? state.saleReturns : []);
      setStockMovements(
        Array.isArray(state.stockMovements) ? state.stockMovements : [],
      );
      setActivities(Array.isArray(state.activities) ? state.activities : []);
      setSecurityAudits(
        Array.isArray(state.securityAudits) ? state.securityAudits : [],
      );
      setIsInitialized(true);
    };

    loadData();
  }, []);

  // Poll suppliers from API every 30 seconds (moderate volatility - supplier edits)
  const { data: suppliersData, refetch: refetchSuppliers } = useQuery({
    queryKey: ["suppliers", activeBusinessId],
    queryFn: () => apiSuppliers(user?.token, activeBusinessId),
    enabled: !!user?.token && !!activeBusinessId && isInitialized,
    staleTime: 3000, // 3 seconds - prevent cache thrashing
  });

  // Poll products from API every 30 seconds (moderate volatility - pricing/stock)
  const { data: productsData, refetch: refetchProducts } = useQuery({
    queryKey: ["products", activeBusinessId],
    queryFn: () => apiProducts(user?.token, activeBusinessId),
    enabled: !!user?.token && !!activeBusinessId && isInitialized,
    staleTime: 3000, // 3 seconds - prevent cache thrashing
  });

  // Poll inventory movements from API every 20 seconds (critical for stock accuracy)
  const { data: inventoryData, refetch: refetchInventory } = useQuery({
    queryKey: ["inventory", "movements", activeBusinessId],
    queryFn: () => apiInventory(user?.token, activeBusinessId),
    enabled: !!user?.token && !!activeBusinessId && isInitialized,
    staleTime: 3000, // 3 seconds - prevent cache thrashing
  });

  // Poll sales from API every 15 seconds (business-critical, revenue tracking)
  const { data: salesData, refetch: refetchSales } = useQuery({
    queryKey: ["sales", activeBusinessId],
    queryFn: () => apiSales(user?.token, activeBusinessId),
    enabled: !!user?.token && !!activeBusinessId && isInitialized,
    staleTime: 3000, // 3 seconds - prevent cache thrashing
  });

  // Poll sale returns from API every 30 seconds (moderate priority - historical data)
  const { data: saleReturnsData, refetch: refetchSaleReturns } = useQuery({
    queryKey: ["sales", "returns", activeBusinessId],
    queryFn: () => apiSaleReturns(user?.token, activeBusinessId),
    enabled: !!user?.token && !!activeBusinessId && isInitialized,
    staleTime: 3000, // 3 seconds - prevent cache thrashing
  });

  // Poll activities from API every 30 seconds (audit log - low volatility)
  const { data: activitiesData, refetch: refetchActivities } = useQuery({
    queryKey: ["activities", activeBusinessId],
    queryFn: () => apiActivities(user?.token, activeBusinessId),
    enabled: !!user?.token && !!activeBusinessId && isInitialized,
    staleTime: 3000, // 3 seconds - prevent cache thrashing
  });

  // Poll security audits from API every 60 seconds (read-only audit trail)
  const { data: securityAuditsData, refetch: refetchSecurityAudits } = useQuery(
    {
      queryKey: ["security-audits", user?.id],
      queryFn: () => apiSecurityAudits(user?.token, user?.id),
      enabled: !!user?.token && !!user?.id && isInitialized,
      staleTime: 60000, // 60 seconds - lower priority than activities
    },
  );

  // Update state when API data changes
  useEffect(() => {
    if (suppliersData !== undefined && suppliersData !== null) {
      setSuppliers(suppliersData);
      const state = storage.getState();
      state.suppliers = suppliersData;
      storage.saveState(state);
    }
  }, [suppliersData]);

  useEffect(() => {
    if (productsData !== undefined && productsData !== null) {
      setProducts(productsData);
      const state = storage.getState();
      state.products = productsData;
      storage.saveState(state);
    }
  }, [productsData]);

  useEffect(() => {
    if (inventoryData !== undefined && inventoryData !== null) {
      const validData = Array.isArray(inventoryData) ? inventoryData : [];
      setStockMovements(validData);
      const state = storage.getState();
      state.stockMovements = validData;
      storage.saveState(state);
    }
  }, [inventoryData]);

  useEffect(() => {
    if (salesData !== undefined && salesData !== null) {
      const validData = Array.isArray(salesData) ? salesData : [];
      setSales(validData);
      const state = storage.getState();
      state.sales = validData;
      storage.saveState(state);
    }
  }, [salesData]);

  useEffect(() => {
    if (saleReturnsData !== undefined && saleReturnsData !== null) {
      setSaleReturns(saleReturnsData);
      const state = storage.getState();
      state.saleReturns = saleReturnsData;
      storage.saveState(state);
    }
  }, [saleReturnsData]);

  useEffect(() => {
    if (activitiesData !== undefined && activitiesData !== null) {
      setActivities(activitiesData);
      const state = storage.getState();
      state.activities = activitiesData;
      storage.saveState(state);
    }
  }, [activitiesData]);

  useEffect(() => {
    if (securityAuditsData !== undefined && securityAuditsData !== null) {
      setSecurityAudits(securityAuditsData);
      const state = storage.getState();
      state.securityAudits = securityAuditsData;
      storage.saveState(state);
    }
  }, [securityAuditsData]);

  // Set initial loading states to false after first successful data load
  useEffect(() => {
    if (
      productsData !== undefined &&
      productsData !== null &&
      isInitialLoadingProducts
    ) {
      setIsInitialLoadingProducts(false);
    }
  }, [productsData, isInitialLoadingProducts]);

  useEffect(() => {
    if (
      suppliersData !== undefined &&
      suppliersData !== null &&
      isInitialLoadingSuppliers
    ) {
      setIsInitialLoadingSuppliers(false);
    }
  }, [suppliersData, isInitialLoadingSuppliers]);

  useEffect(() => {
    if (
      salesData !== undefined &&
      salesData !== null &&
      isInitialLoadingSales
    ) {
      setIsInitialLoadingSales(false);
    }
  }, [salesData, isInitialLoadingSales]);

  useEffect(() => {
    if (
      inventoryData !== undefined &&
      inventoryData !== null &&
      isInitialLoadingInventory
    ) {
      setIsInitialLoadingInventory(false);
    }
  }, [inventoryData, isInitialLoadingInventory]);

  // Refetch data from API immediately (for instant updates after creating records)
  const refetchData = useCallback(async () => {
    await Promise.all([
      refetchProducts(),
      refetchSuppliers(),
      refetchInventory(),
      refetchSales(),
      refetchSaleReturns(),
      refetchActivities(),
      refetchSecurityAudits(),
    ]);
  }, [
    refetchProducts,
    refetchSuppliers,
    refetchInventory,
    refetchSales,
    refetchSaleReturns,
    refetchActivities,
    refetchSecurityAudits,
  ]);

  // Utility functions for sale returns
  const getSaleReturns = useCallback(() => saleReturns, [saleReturns]);
  const getSaleReturnById = useCallback(
    (id: string) => {
      return (Array.isArray(saleReturns) ? saleReturns : []).find(
        (r) => r.id === id || (r as any)._id === id,
      );
    },
    [saleReturns],
  );

  // Products
  const addProduct = useCallback(
    async (product: Product) => {
      const selectedSupplier = suppliers.find(
        (s) => s.id === product.supplierId || s._id === product.supplierId,
      );

      const resolvedSupplierId = resolveReferenceId(selectedSupplier);

      const productWithBusinessId = {
        ...product,
        businessId: user?.businessId ?? product.businessId,
        supplierId: resolvedSupplierId || "",
        id: product.id || product._id || uuidv4(),
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: product.updatedAt || new Date().toISOString(),
      };

      const previousProducts = products;
      const optimisticProducts = [productWithBusinessId, ...products];
      persistProducts(optimisticProducts);

      const response = await sendApiRequest(
        "POST",
        "/products/new",
        productWithBusinessId,
      );
      if (response?.ok) {
        await refetchProducts();
      } else {
        persistProducts(previousProducts);
        throw new Error("Failed to save product. Please try again.");
      }
    },
    [
      persistProducts,
      products,
      refetchProducts,
      suppliers,
      user?.businessId,
      sendApiRequest,
      resolveReferenceId,
    ],
  );

  const updateProduct = useCallback(
    async (id: string, product: Partial<Product>) => {
      const productWithBusinessId = {
        ...product,
        businessId: product.businessId || user?.businessId,
        updatedAt: new Date().toISOString(),
      };

      const previousProducts = products;
      const optimisticProducts = products.map((existingProduct) =>
        existingProduct.id === id || (existingProduct as any)._id === id
          ? { ...existingProduct, ...productWithBusinessId }
          : existingProduct,
      );
      persistProducts(optimisticProducts);

      const response = await sendApiRequest(
        "PUT",
        `/products/${id}/update`,
        productWithBusinessId,
      );
      if (response?.ok) {
        await refetchProducts();
      } else {
        persistProducts(previousProducts);
        throw new Error("Failed to update product. Please try again.");
      }
    },
    [
      persistProducts,
      products,
      refetchProducts,
      sendApiRequest,
      user?.businessId,
    ],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const previousProducts = products;
      const optimisticProducts = products.filter(
        (existingProduct) =>
          existingProduct.id !== id && (existingProduct as any)._id !== id,
      );
      persistProducts(optimisticProducts);

      const response = await sendApiRequest(
        "DELETE",
        `/products/${id}/delete`,
        { id },
      );
      if (response?.ok) {
        await refetchProducts();
      } else {
        persistProducts(previousProducts);
      }
    },
    [persistProducts, products, refetchProducts, sendApiRequest],
  );

  // Suppliers
  const addSupplier = useCallback(
    async (supplier: Supplier) => {
      const supplierWithBusinessId = {
        ...supplier,
        businessId: supplier.businessId || user?.businessId,
        id: supplier.id || supplier._id || uuidv4(),
        createdAt: supplier.createdAt || new Date().toISOString(),
        updatedAt: supplier.updatedAt || new Date().toISOString(),
      };

      const previousSuppliers = suppliers;
      const optimisticSuppliers = [supplierWithBusinessId, ...suppliers];
      persistSuppliers(optimisticSuppliers);

      const response = await sendApiRequest(
        "POST",
        "/suppliers/create",
        supplierWithBusinessId,
      );

      if (response?.ok) {
        await refetchSuppliers();
      } else {
        persistSuppliers(previousSuppliers);
      }
    },
    [
      persistSuppliers,
      refetchSuppliers,
      sendApiRequest,
      suppliers,
      user?.businessId,
    ],
  );

  const updateSupplier = useCallback(
    async (id: string, supplier: Partial<Supplier>) => {
      const supplierWithBusinessId = {
        ...supplier,
        businessId: supplier.businessId || user?.businessId,
        updatedAt: new Date().toISOString(),
      };

      const previousSuppliers = suppliers;
      const optimisticSuppliers = suppliers.map((existingSupplier) =>
        existingSupplier.id === id || (existingSupplier as any)._id === id
          ? { ...existingSupplier, ...supplierWithBusinessId }
          : existingSupplier,
      );
      persistSuppliers(optimisticSuppliers);

      const response = await sendApiRequest(
        "PUT",
        `/suppliers/${id}/update`,
        supplierWithBusinessId,
      );

      if (response?.ok) {
        await refetchSuppliers();
      } else {
        persistSuppliers(previousSuppliers);
      }
    },
    [
      persistSuppliers,
      refetchSuppliers,
      sendApiRequest,
      suppliers,
      user?.businessId,
    ],
  );

  const deleteSupplier = useCallback(
    async (id: string) => {
      const previousSuppliers = suppliers;
      const optimisticSuppliers = suppliers.filter(
        (existingSupplier) =>
          existingSupplier.id !== id && (existingSupplier as any)._id !== id,
      );
      persistSuppliers(optimisticSuppliers);

      const response = await sendApiRequest(
        "DELETE",
        `/suppliers/${id}/delete`,
        { id },
      );

      if (response?.ok) {
        await refetchSuppliers();
      } else {
        persistSuppliers(previousSuppliers);
      }
    },
    [persistSuppliers, refetchSuppliers, sendApiRequest, suppliers],
  );

  // Sales
  const addSale = useCallback(
    async (sale: Sale) => {
      const saleWithBusinessId = {
        ...sale,
        businessId: user?.businessId ?? sale.businessId,
        id: sale.id || sale._id || uuidv4(),
        createdAt: sale.createdAt || new Date().toISOString(),
        items: sale.items.map((item) => {
          const selectedProduct = products.find(
            (p) => p.id === item.productId || p._id === item.productId,
          );

          const resolvedProductId = resolveReferenceId(selectedProduct);

          return {
            ...item,
            productId: resolvedProductId || "",
          };
        }),
      };

      const previousSales = sales;
      const previousProducts = products;
      const previousStockMovements = stockMovements;

      const optimisticSales = [...sales, saleWithBusinessId];
      const updatedProducts = products.map((product) => {
        const saleItem = saleWithBusinessId.items.find(
          (item) =>
            product.id === item.productId ||
            (product as any)._id === item.productId,
        );

        if (!saleItem) return product;

        return {
          ...product,
          currentStock: product.currentStock - saleItem.quantity,
        };
      });

      const newMovements: StockMovement[] = saleWithBusinessId.items.map(
        (item) => ({
          id: Math.random().toString(36).substr(2, 9),
          productId: item.productId,
          type: "out",
          quantity: item.quantity,
          reason: "Sale",
          reference: saleWithBusinessId.saleNumber,
          createdBy: user?.id || user?._id || "system",
          createdAt: new Date().toISOString(),
        }),
      );

      persistProducts(updatedProducts);
      persistStockMovements([...stockMovements, ...newMovements]);
      persistSales(optimisticSales);

      try {
        const response = await sendApiRequest(
          "POST",
          "/sales/create",
          saleWithBusinessId,
        );

        if (response?.ok) {
          await Promise.all([
            refetchSales(),
            refetchProducts(),
            refetchInventory(),
          ]);
        } else {
          throw new Error("Failed to create sale. Please try again.");
        }
      } catch (error) {
        persistSales(previousSales);
        persistProducts(previousProducts);
        persistStockMovements(previousStockMovements);
        throw error;
      }
    },
    [
      persistProducts,
      persistSales,
      persistStockMovements,
      products,
      sales,
      stockMovements,
      refetchSales,
      refetchProducts,
      refetchInventory,
      resolveReferenceId,
      sendApiRequest,
      user?.businessId,
      user?.id,
      user?._id,
    ],
  );

  // Helper function to calculate stock movement deltas
  const calculateStockMovementsDelta = (
    originalItems: SaleItem[],
    updatedItems: SaleItem[],
  ) => {
    const deltas: Array<{
      productId: string;
      quantity: number;
      type: "in" | "out";
      reason: "Sale" | "Return";
    }> = [];

    // Create maps for easy lookup
    const originalMap = new Map<string, number>();
    const updatedMap = new Map<string, number>();

    originalItems.forEach((item) => {
      const key = item.productId || "";
      if (key) {
        originalMap.set(key, item.quantity);
      }
    });

    updatedItems.forEach((item) => {
      const key = item.productId || "";
      if (key) {
        updatedMap.set(key, item.quantity);
      }
    });

    // Check all products from both original and updated
    const allProductIds = new Set([
      ...originalMap.keys(),
      ...updatedMap.keys(),
    ]);

    allProductIds.forEach((productId) => {
      const originalQty = originalMap.get(productId) || 0;
      const updatedQty = updatedMap.get(productId) || 0;
      const delta = updatedQty - originalQty;

      if (delta > 0) {
        // Increased quantity - stock out for sale
        deltas.push({
          productId,
          quantity: delta,
          type: "out",
          reason: "Sale",
        });
      } else if (delta < 0) {
        // Decreased quantity - stock in for return
        deltas.push({
          productId,
          quantity: Math.abs(delta),
          type: "in",
          reason: "Return",
        });
      }
    });

    return deltas;
  };

  const updateSale = useCallback(
    async (id: string, sale: Partial<Sale>) => {
      const originalSale = sales.find(
        (s) => s.id === id || (s as any)._id === id,
      );
      if (!originalSale) {
        throw new Error("Sale not found");
      }

      const saleWithBusinessId = {
        ...sale,
        businessId: sale.businessId || user?.businessId,
        items:
          sale.items?.map((item, index) => {
            const oldItem = originalSale.items[index];
            const selectedProduct = products.find(
              (p) => p.id === item.productId || p._id === item.productId,
            );

            const resolvedProductId = resolveReferenceId(selectedProduct);

            return {
              ...item,
              productId: resolvedProductId || oldItem?.productId || "",
            };
          }) || originalSale.items,
      };

      // Capture state before optimistic update
      const previousProducts = products;
      const previousSales = sales;
      const previousStockMovements = stockMovements;

      const localAction = () => {
        const movementDeltas = calculateStockMovementsDelta(
          originalSale.items,
          saleWithBusinessId.items || [],
        );

        const oldMovements = stockMovements.filter(
          (m) => m.reference === `SALE-${originalSale.saleNumber}`,
        );

        let updatedProducts = products.map((product) => {
          let stockAdjustment = 0;
          for (const oldMovement of oldMovements) {
            if (
              product.id === oldMovement.productId ||
              (product as any)._id === oldMovement.productId
            ) {
              if (oldMovement.type === "out") {
                stockAdjustment += oldMovement.quantity;
              } else if (oldMovement.type === "in") {
                stockAdjustment -= oldMovement.quantity;
              }
            }
          }
          if (stockAdjustment !== 0) {
            return {
              ...product,
              currentStock: product.currentStock + stockAdjustment,
            };
          }
          return product;
        });

        const newMovements: StockMovement[] = movementDeltas.map((delta) => ({
          id: Math.random().toString(36).substr(2, 9),
          productId: delta.productId,
          type: delta.type,
          quantity: delta.quantity,
          reason: delta.reason,
          reference: `SALE-${originalSale.saleNumber}`,
          createdBy: user?.id || user?._id || "system",
          createdAt: new Date().toISOString(),
        }));

        updatedProducts = updatedProducts.map((product) => {
          let totalStockChange = 0;
          for (const movement of newMovements) {
            if (
              product.id === movement.productId ||
              (product as any)._id === movement.productId
            ) {
              if (movement.type === "in") {
                totalStockChange += movement.quantity;
              } else if (movement.type === "out") {
                totalStockChange -= movement.quantity;
              }
            }
          }
          if (totalStockChange !== 0) {
            return {
              ...product,
              currentStock: product.currentStock + totalStockChange,
            };
          }
          return product;
        });

        updatedProducts = [...updatedProducts];
        const updatedStockMovements = stockMovements.filter(
          (m) => m.reference !== `SALE-${originalSale.saleNumber}`,
        );

        const updatedSales = sales.map((s) =>
          s.id === id || (s as any)._id === id
            ? {
                ...s,
                ...saleWithBusinessId,
                updatedAt: new Date().toISOString(),
              }
            : s,
        );

        storage.updateSale(id, saleWithBusinessId);
        persistSales(updatedSales);
        persistProducts(updatedProducts);
        persistStockMovements([...updatedStockMovements, ...newMovements]);
      };

      localAction();
      try {
        const response = await sendApiRequest(
          "PUT",
          `/sales/${id}/update`,
          saleWithBusinessId,
        );

        if (!response?.ok) {
          throw new Error("Failed to update sale. Please try again.");
        }
      } catch (error) {
        persistSales(previousSales);
        persistProducts(previousProducts);
        persistStockMovements(previousStockMovements);
        throw error;
      }
    },
    [
      sales,
      stockMovements,
      products,
      persistProducts,
      persistSales,
      persistStockMovements,
      user?.token,
      user?.businessId,
      user?.id,
      user?._id,
      sendApiRequest,
      resolveReferenceId,
      calculateStockMovementsDelta,
    ],
  );

  const deleteSale = useCallback(
    async (id: string) => {
      const localAction = () => {
        storage.deleteSale(id);
        setSales(sales.filter((s) => s.id !== id && (s as any)._id !== id));
      };

      localAction();
      await sendApiRequest("DELETE", `/sales/${id}/delete`, { id });
    },
    [sales, user?.token, sendApiRequest],
  );

  // Sale Returns
  const processSaleReturn = useCallback(
    async (saleReturn: SaleReturn) => {
      const selectedSale = sales.find(
        (s) => s.id === saleReturn.saleId || s._id === saleReturn.saleId,
      );

      const resolvedSaleId = resolveReferenceId(selectedSale);

      const returnWithBusinessId = {
        ...saleReturn,
        businessId: user?.businessId ?? saleReturn.businessId,
        saleId: resolvedSaleId || "",
      };

      const localAction = () => {
        storage.processSaleReturn(returnWithBusinessId);

        const originalSale = sales.find(
          (s) =>
            s.id === returnWithBusinessId.saleId ||
            s._id === returnWithBusinessId.saleId,
        );

        const updatedProducts = products.map((product) => {
          const returnItem = returnWithBusinessId.items.find(
            (item) =>
              item.productId === product.id ||
              item.productId === (product as any)._id,
          );
          if (returnItem) {
            return {
              ...product,
              currentStock: product.currentStock + returnItem.quantity,
            };
          }
          return product;
        });
        setProducts([...updatedProducts]);

        const newMovements: StockMovement[] = returnWithBusinessId.items.map(
          (item) => ({
            id: Math.random().toString(36).substr(2, 9),
            productId: item.productId,
            type: "in" as const,
            quantity: item.quantity,
            reason: "Return",
            reference:
              returnWithBusinessId.reference ||
              `SALE-${originalSale?.saleNumber}` ||
              "",
            createdBy: user?.id || user?._id || "system",
            createdAt: new Date().toISOString(),
          }),
        );
        setStockMovements((prev) => [...prev, ...newMovements]);

        if (originalSale) {
          const totalReturnedQuantity = returnWithBusinessId.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );
          const totalSoldQuantity = originalSale.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );
          const newReturnStatus =
            totalReturnedQuantity >= totalSoldQuantity ? "returned" : "partial";

          setSales((prev) =>
            prev.map((sale) =>
              sale.id === originalSale.id || sale._id === originalSale._id
                ? { ...sale, returnStatus: newReturnStatus }
                : sale,
            ),
          );
        }

        queryClient.invalidateQueries({
          queryKey: ["products", user?.businessId],
        });
        queryClient.invalidateQueries({
          queryKey: ["inventory", "movements", user?.businessId],
        });
        queryClient.invalidateQueries({
          queryKey: ["sales", user?.businessId],
        });
        if (originalSale) {
          const totalReturnedQuantity = returnWithBusinessId.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );
          const totalSoldQuantity = originalSale.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );

          queryClient.setQueryData(
            ["sales", user?.businessId],
            (oldData: Sale[] | undefined) =>
              oldData
                ? oldData.map((sale) =>
                    sale.id === originalSale.id || sale._id === originalSale._id
                      ? {
                          ...sale,
                          returnStatus:
                            totalReturnedQuantity >= totalSoldQuantity
                              ? "returned"
                              : "partial",
                        }
                      : sale,
                  )
                : undefined,
          );
        }
      };

      const previousSales = sales;
      const previousProducts = products;
      const previousStockMovements = stockMovements;

      localAction();
      try {
        const response = await sendApiRequest(
          "POST",
          "/sales/return",
          returnWithBusinessId,
        );

        if (!response?.ok) {
          throw new Error("Failed to process sale return. Please try again.");
        }
      } catch (error) {
        persistSales(previousSales);
        persistProducts(previousProducts);
        persistStockMovements(previousStockMovements);
        throw error;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["products", user?.businessId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["sales", user?.businessId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["inventory", "movements", user?.businessId],
        }),
      ]).catch(() => {
        // Continue even if invalidation fails
      });
    },
    [
      user?.token,
      user?.businessId,
      user?.id,
      user?._id,
      products,
      stockMovements,
      sales,
      sendApiRequest,
    ],
  );

  // Stock Movements
  const addStockMovement = useCallback(
    async (movement: StockMovement) => {
      const selectedProduct = products.find(
        (p) => p.id === movement.productId || p._id === movement.productId,
      );

      const resolvedProductId = resolveReferenceId(selectedProduct);
      if (!resolvedProductId) {
        toastError(
          "Unable to resolve the selected product for this stock movement.",
          5000,
        );
        throw new Error("Selected product could not be resolved.");
      }

      const movementWithBusinessId = {
        ...movement,
        businessId: user?.businessId ?? movement.businessId,
        productId: resolvedProductId,
        id: movement.id || movement._id || uuidv4(),
        createdAt: movement.createdAt || new Date().toISOString(),
      };

      const previousProducts = products;
      const previousStockMovements = stockMovements;

      const updatedProducts = products.map((product) => {
        if (
          product.id === movementWithBusinessId.productId ||
          (product as any)._id === movementWithBusinessId.productId
        ) {
          if (movementWithBusinessId.type === "in") {
            return {
              ...product,
              currentStock:
                product.currentStock + movementWithBusinessId.quantity,
            };
          }
          if (movementWithBusinessId.type === "out") {
            return {
              ...product,
              currentStock:
                product.currentStock - movementWithBusinessId.quantity,
            };
          }
          return { ...product, currentStock: movementWithBusinessId.quantity };
        }
        return product;
      });

      persistProducts(updatedProducts);
      persistStockMovements([...stockMovements, movementWithBusinessId]);

      const response = await sendApiRequest(
        "POST",
        "/inventory/movements/add",
        movementWithBusinessId,
      );

      if (response?.ok) {
        await Promise.all([refetchInventory(), refetchProducts()]);
      } else {
        persistProducts(previousProducts);
        persistStockMovements(previousStockMovements);
        throw new Error(
          "Unable to save stock movement. Please check your connection and try again.",
        );
      }
    },
    [
      persistProducts,
      persistStockMovements,
      products,
      refetchInventory,
      refetchProducts,
      sendApiRequest,
      stockMovements,
      user?.businessId,
      resolveReferenceId,
    ],
  );

  // Activity Logging
  const logActivity = useCallback(
    async (
      activityData: Omit<Activity, "id" | "_id" | "createdAt">,
    ): Promise<Activity> => {
      if (!activityData.action) {
        console.error(
          "[DATACONTEXT] Activity logging aborted: missing action",
          activityData,
        );
        return {} as Activity;
      }

      const activityPayload = {
        ...activityData,
        businessId: activityData.businessId || user?.businessId,
        createdBy: activityData.createdBy || user?.id || user?._id,
      };

      try {
        const response = await sendApiRequest(
          "POST",
          "/activities/log",
          activityPayload,
        );

        if (response?.ok) {
          const data = await response.json();
          const newActivity = data.activity as Activity;

          // Add to local state optimistically
          persistActivities([newActivity, ...activities]);

          return newActivity;
        } else {
          console.error("[DATACONTEXT] Failed to log activity:", response);
          throw new Error("Unable to log activity");
        }
      } catch (error: any) {
        console.error("[DATACONTEXT] Error logging activity:", error);
        // Don't throw - activity logging is non-critical, fail silently
        return {} as Activity;
      }
    },
    [
      user?.businessId,
      user?.id,
      user?._id,
      sendApiRequest,
      activities,
      persistActivities,
    ],
  );

  const addActivity = useCallback(
    async (activity: Activity) => {
      const activityWithDefaults: Activity = {
        ...activity,
        businessId: activity.businessId || user?.businessId,
        createdBy: (activity.createdBy || user?.id || user?._id || "system") as
          | string
          | User,
      };

      persistActivities([activityWithDefaults, ...activities]);

      const response = await sendApiRequest(
        "POST",
        "/activities/log",
        activityWithDefaults,
      );

      if (!response?.ok) {
        // Revert on failure
        persistActivities(activities);
        throw new Error("Unable to save activity");
      }
    },
    [
      activities,
      persistActivities,
      sendApiRequest,
      user?.businessId,
      user?.id,
      user?._id,
    ],
  );

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id || (p as any)._id === id),
    [products],
  );

  const getSupplierById = useCallback(
    (id: string) => suppliers.find((s) => s.id === id || (s as any)._id === id),
    [suppliers],
  );

  const getSalesForUser = useCallback(
    (userId: string) =>
      sales.filter((s) => s.createdBy === userId || s._id === userId),
    [sales],
  );

  const getProductStockHistory = useCallback(
    (productId: string) =>
      stockMovements.filter(
        (m) => m.productId === productId || (m as any)._id === productId,
      ),
    [stockMovements],
  );

  // Activity Filtering Utilities
  const getActivitiesByType = useCallback(
    (entityType: string) =>
      activities.filter((activity) => activity.entityType === entityType),
    [activities],
  );

  const getActivitiesByEntity = useCallback(
    (entityId: string) =>
      activities.filter(
        (activity) =>
          activity.entityId === entityId || activity.referenceId === entityId,
      ),
    [activities],
  );

  const getActivitiesByUser = useCallback(
    (userId: string) =>
      activities.filter((activity) => {
        if (typeof activity.createdBy === "string") {
          return activity.createdBy === userId;
        }
        return (
          (activity.createdBy as any)?.id === userId ||
          (activity.createdBy as any)?._id === userId
        );
      }),
    [activities],
  );

  const getActivitiesByAction = useCallback(
    (action: string) =>
      activities.filter((activity) => activity.action === action),
    [activities],
  );

  const getActivitiesByDateRange = useCallback(
    (startDate: Date, endDate: Date) =>
      activities.filter((activity) => {
        const activityDate = new Date(activity.createdAt);
        return activityDate >= startDate && activityDate <= endDate;
      }),
    [activities],
  );

  const getActivitiesByStatus = useCallback(
    (status: string) =>
      activities.filter((activity) => activity.status === status),
    [activities],
  );

  const searchActivities = useCallback(
    (query: string) => {
      const searchLower = query.toLowerCase();
      return activities.filter(
        (activity) =>
          activity.title.toLowerCase().includes(searchLower) ||
          activity.description.toLowerCase().includes(searchLower) ||
          activity.referenceId?.toLowerCase().includes(searchLower) ||
          activity.entityId?.toLowerCase().includes(searchLower),
      );
    },
    [activities],
  );

  const getActivitiesWithFilters = useCallback(
    (filters: {
      entityType?: string;
      entityId?: string;
      userId?: string;
      action?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
      searchQuery?: string;
    }) => {
      let filtered = activities;

      if (filters.entityType) {
        filtered = filtered.filter(
          (activity) => activity.entityType === filters.entityType,
        );
      }

      if (filters.entityId) {
        filtered = filtered.filter(
          (activity) =>
            activity.entityId === filters.entityId ||
            activity.referenceId === filters.entityId,
        );
      }

      if (filters.userId) {
        filtered = filtered.filter((activity) => {
          if (typeof activity.createdBy === "string") {
            return activity.createdBy === filters.userId;
          }
          return (
            (activity.createdBy as any)?.id === filters.userId ||
            (activity.createdBy as any)?._id === filters.userId
          );
        });
      }

      if (filters.action) {
        filtered = filtered.filter(
          (activity) => activity.action === filters.action,
        );
      }

      if (filters.status) {
        filtered = filtered.filter(
          (activity) => activity.status === filters.status,
        );
      }

      if (filters.startDate || filters.endDate) {
        filtered = filtered.filter((activity) => {
          const activityDate = new Date(activity.createdAt);
          if (filters.startDate && activityDate < filters.startDate)
            return false;
          if (filters.endDate && activityDate > filters.endDate) return false;
          return true;
        });
      }

      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (activity) =>
            activity.title.toLowerCase().includes(searchLower) ||
            activity.description.toLowerCase().includes(searchLower) ||
            activity.referenceId?.toLowerCase().includes(searchLower) ||
            activity.entityId?.toLowerCase().includes(searchLower),
        );
      }

      return filtered;
    },
    [activities],
  );

  return (
    <DataContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        sales,
        addSale,
        updateSale,
        deleteSale,
        processSaleReturn,
        saleReturns,
        getSaleReturns,
        getSaleReturnById,
        refetchSaleReturns,
        stockMovements,
        addStockMovement,
        activities,
        addActivity,
        refetchActivities,
        logActivity,
        getActivitiesByType,
        getActivitiesByEntity,
        getActivitiesByUser,
        getActivitiesByAction,
        getActivitiesByDateRange,
        getActivitiesByStatus,
        searchActivities,
        getActivitiesWithFilters,
        securityAudits,
        refetchSecurityAudits,
        getProductById,
        getSupplierById,
        getSalesForUser,
        getProductStockHistory,
        refresh,
        refetchData,
        refetchProducts,
        refetchInventory,
        // Loading states for skeleton loaders
        isInitialLoadingProducts,
        isInitialLoadingSuppliers,
        isInitialLoadingSales,
        isInitialLoadingInventory,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

export const useDataContext = useData;
