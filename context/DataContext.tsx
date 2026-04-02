"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Product, Supplier, Sale, StockMovement } from "@/lib/types";
import { storage } from "@/lib/storage";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./AuthContext";
import { useOfflineSync } from "@/hooks/useOfflineSync";

// API functions for polling
const apiSuppliers = async (token?: string) => {
  try {
    const response = await apiRequest(
      "GET",
      "/suppliers/all",
      {
        limit: 20,
        status: "active",
      },
      token,
    );

    if (response.ok) {
      const data = await response.json();
      return data || [];
    }
  } catch (error) {
    console.warn("Failed to fetch suppliers from API:", error);
  }
  return null;
};

const apiProducts = async (token?: string) => {
  try {
    const response = await apiRequest(
      "GET",
      "/products/all",
      {
        limit: 20,
        status: "active",
      },
      token,
    );

    if (response.ok) {
      const data = await response.json();
      return data || [];
    }
  } catch (error) {
    console.warn("Failed to fetch products from API:", error);
  }
  return null;
};

const apiInventory = async (token?: string) => {
  try {
    const response = await apiRequest(
      "GET",
      "/inventory/movements",
      {
        limit: 100,
        status: "active",
      },
      token,
    );

    if (response.ok) {
      const data = await response.json();
      return (data && data.movements) || data || [];
    }
  } catch (error) {
    console.warn("Failed to fetch inventory movements from API:", error);
  }
  return null;
};

const apiSales = async (token?: string) => {
  try {
    const response = await apiRequest(
      "GET",
      "/sales/all",
      {
        limit: 100,
        status: "active",
      },
      token,
    );

    if (response.ok) {
      const data = await response.json();
      return data || [];
    }
  } catch (error) {
    console.warn("Failed to fetch sales from API:", error);
  }
  return null;
};

interface DataContextType {
  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Sales
  sales: Sale[];
  addSale: (sale: Sale) => Promise<void>;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;

  // Stock Movements
  stockMovements: StockMovement[];
  addStockMovement: (movement: StockMovement) => void;

  // Utilities
  getProductById: (id: string) => Product | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
  getSalesForUser: (userId: string) => Sale[];
  getProductStockHistory: (productId: string) => StockMovement[];
  refresh: () => void;
  refetchData: () => Promise<void>;
  refetchProducts: () => Promise<any>;
  refetchInventory: () => Promise<any>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { isOnline, enqueueAction } = useOfflineSync();

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from storage on mount - only if storage has been initialized
  useEffect(() => {
    const loadData = () => {
      // Check if local storage has been initialized (has erp_system_state key)
      const hasStorage =
        typeof window !== "undefined" &&
        localStorage.getItem("erp_system_state") !== null;

      if (hasStorage) {
        if (storage.getProducts() && Array.isArray(storage.getProducts())) {
          setProducts(storage.getProducts());
        } else {
          setProducts([]);
        }

        setSales(storage.getSales());
        setStockMovements(storage.getStockMovements());
        setSuppliers(storage.getSuppliers() || []);
      }

      setIsInitialized(true);
    };

    loadData();
  }, []);

  // Poll suppliers from API every 60 seconds (reduced from 5s to prevent server overload)
  const { data: suppliersData, refetch: refetchSuppliers } = useQuery({
    queryKey: ["suppliers", "all", user?.token],
    queryFn: () => apiSuppliers(user?.token),
    enabled: !!user?.token && isInitialized,
    staleTime: 60000, // 60 seconds before data is considered stale
    refetchInterval: 60000, // Poll every 60 seconds instead of 5
  });

  // Poll products from API every 60 seconds (reduced from 5s to prevent server overload)
  const { data: productsData, refetch: refetchProducts } = useQuery({
    queryKey: ["products", "all", user?.token],
    queryFn: () => apiProducts(user?.token),
    enabled: !!user?.token && isInitialized,
    staleTime: 60000, // 60 seconds before data is considered stale
    refetchInterval: 60000, // Poll every 60 seconds instead of 5
  });

  // Poll inventory movements from API every 60 seconds (reduced from 5s to prevent server overload)
  const { data: inventoryData, refetch: refetchInventory } = useQuery({
    queryKey: ["inventory", "movements", user?.token],
    queryFn: () => apiInventory(user?.token),
    enabled: !!user?.token && isInitialized,
    staleTime: 60000, // 60 seconds before data is considered stale
    refetchInterval: 60000, // Poll every 60 seconds instead of 5
  });

  // Poll sales from API every 60 seconds (reduced from 5s to prevent server overload)
  const { data: salesData, refetch: refetchSales } = useQuery({
    queryKey: ["sales", "all", user?.token],
    queryFn: () => apiSales(user?.token),
    enabled: !!user?.token && isInitialized,
    staleTime: 60000, // 60 seconds before data is considered stale
    refetchInterval: 60000, // Poll every 60 seconds instead of 5
  });

  // Update state when API data changes
  useEffect(() => {
    if (suppliersData) {
      setSuppliers(suppliersData);
      // Also save to storage for persistence
      const state = storage.getState();
      state.suppliers = suppliersData;
      storage.saveState(state);
    }
  }, [suppliersData]);

  useEffect(() => {
    if (productsData) {
      setProducts(productsData);
      // Also save to storage for persistence
      const state = storage.getState();
      state.products = productsData;
      storage.saveState(state);
    }
  }, [productsData]);

  useEffect(() => {
    if (inventoryData) {
      setStockMovements(inventoryData);
      // Also save to storage for persistence
      const state = storage.getState();
      state.stockMovements = inventoryData;
      storage.saveState(state);
    }
  }, [inventoryData]);

  useEffect(() => {
    if (salesData) {
      setSales(salesData);
      // Also save to storage for persistence
      const state = storage.getState();
      state.sales = salesData;
      storage.saveState(state);
    }
  }, [salesData]);

  const refresh = useCallback(() => {
    setProducts(storage.getProducts());
    setSuppliers(storage.getSuppliers());
    setSales(storage.getSales());
    setStockMovements(storage.getStockMovements());
  }, []);

  // Refetch data from API immediately (for instant updates after creating records)
  const refetchData = useCallback(async () => {
    await Promise.all([
      refetchProducts(),
      refetchSuppliers(),
      refetchInventory(),
      refetchSales(),
    ]);
  }, [refetchProducts, refetchSuppliers, refetchInventory, refetchSales]);

  // Products
  const addProduct = useCallback(
    (product: Product) => {
      storage.addProduct(product);
      setProducts([...products, product]);
    },
    [products],
  );

  const updateProduct = useCallback(
    (id: string, product: Partial<Product>) => {
      storage.updateProduct(id, product);
      setProducts(
        products.map((p) =>
          p.id === id
            ? {
                ...p,
                ...product,
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      );
    },
    [products],
  );

  const deleteProduct = useCallback(
    (id: string) => {
      storage.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
    },
    [products],
  );

  // Suppliers
  const addSupplier = useCallback(
    (supplier: Supplier) => {
      storage.addSupplier(supplier);
      setSuppliers([...suppliers, supplier]);
    },
    [suppliers],
  );

  const updateSupplier = useCallback(
    (id: string, supplier: Partial<Supplier>) => {
      storage.updateSupplier(id, supplier);
      setSuppliers(
        suppliers.map((s) =>
          s.id === id
            ? {
                ...s,
                ...supplier,
                updatedAt: new Date().toISOString(),
              }
            : s,
        ),
      );
    },
    [suppliers],
  );

  const deleteSupplier = useCallback(
    (id: string) => {
      storage.deleteSupplier(id);
      setSuppliers(suppliers.filter((s) => s.id !== id));
    },
    [suppliers],
  );

  // Sales
  const addSale = useCallback(
    async (sale: Sale) => {
      storage.addSale(sale);
      // Send to API if online
      if (isOnline && user?.token) {
        try {
          await apiRequest("POST", "/sales/create", sale, user.token);
          // Immediately refetch products and sales to reflect stock changes
          refetchProducts();
          refetchSales();
        } catch (error) {
          console.warn("Failed to save sale to API:", error);
          // Enqueue for later sync
          enqueueAction({
            endpoint: "/sales/create",
            method: "POST",
            payload: sale,
            type: "addSale",
          });
        }
      } else {
        // Offline: enqueue action
        enqueueAction({
          endpoint: "/sales/create",
          method: "POST",
          payload: sale,
          type: "addSale",
        });
      }
    },
    [user?.token, isOnline, enqueueAction, refetchProducts, refetchSales],
  );

  const updateSale = useCallback(
    (id: string, sale: Partial<Sale>) => {
      storage.updateSale(id, sale);
      setSales(sales.map((s) => (s.id === id ? { ...s, ...sale } : s)));
    },
    [sales],
  );

  const deleteSale = useCallback(
    (id: string) => {
      storage.deleteSale(id);
      setSales(sales.filter((s) => s.id !== id));
    },
    [sales],
  );

  // Stock Movements
  const addStockMovement = useCallback((movement: StockMovement) => {
    storage.addStockMovement(movement);
    // Immediately refetch products and inventory to reflect stock changes
    refetchProducts();
    refetchInventory();
  }, [refetchProducts, refetchInventory]);

  // Utilities
  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id || (p as any)._id === id),
    [products],
  );

  const getSupplierById = useCallback(
    (id: string) => suppliers.find((s) => s.id === id),
    [suppliers],
  );

  const getSalesForUser = useCallback(
    (userId: string) => sales.filter((s) => s.createdBy === userId),
    [sales],
  );

  const getProductStockHistory = useCallback(
    (productId: string) =>
      stockMovements.filter((m) => m.productId === productId),
    [stockMovements],
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
        stockMovements,
        addStockMovement,
        getProductById,
        getSupplierById,
        getSalesForUser,
        getProductStockHistory,
        refresh,
        refetchData,
        refetchProducts,
        refetchInventory,
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
