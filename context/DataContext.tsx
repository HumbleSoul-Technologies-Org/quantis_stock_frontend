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
    queryKey: ["suppliers", user?.businessId],
    queryFn: () => apiSuppliers(user?.token),
    enabled: !!user?.token && !!user?.businessId && isInitialized,
    staleTime: 60000, // 60 seconds before data is considered stale
    refetchInterval: 60000, // Poll every 60 seconds instead of 5
  });

  // Poll products from API every 60 seconds (reduced from 5s to prevent server overload)
  const { data: productsData, refetch: refetchProducts } = useQuery({
    queryKey: ["products", user?.businessId],
    queryFn: () => apiProducts(user?.token),
    enabled: !!user?.token && !!user?.businessId && isInitialized,
    staleTime: 60000, // 60 seconds before data is considered stale
    refetchInterval: 60000, // Poll every 60 seconds instead of 5
  });

  // Poll inventory movements from API every 60 seconds (reduced from 5s to prevent server overload)
  const { data: inventoryData, refetch: refetchInventory } = useQuery({
    queryKey: ["inventory", "movements", user?.businessId],
    queryFn: () => apiInventory(user?.token),
    enabled: !!user?.token && isInitialized,
    staleTime: 60000, // 60 seconds before data is considered stale
    refetchInterval: 60000, // Poll every 60 seconds instead of 5
  });

  // Poll sales from API every 60 seconds (reduced from 5s to prevent server overload)
  const { data: salesData, refetch: refetchSales } = useQuery({
    queryKey: ["sales", user?.businessId],
    queryFn: () => apiSales(user?.token),
    enabled: !!user?.token && !!user?.businessId && isInitialized,
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
    async (product: Product) => {
      // Ensure businessId is included
      const productWithBusinessId = {
        ...product,
        businessId: product.businessId || user?.businessId,
      };

      storage.addProduct(productWithBusinessId);
      setProducts([...products, productWithBusinessId]);
      // Send to API if online
      if (isOnline && user?.token) {
        try {
          await apiRequest(
            "POST",
            "/products/new",
            productWithBusinessId,
            user.token,
          );
          // Immediately refetch products to ensure consistency
          refetchProducts();
        } catch (error) {
          console.warn("Failed to save product to API:", error);
          // Enqueue for later sync
          enqueueAction({
            endpoint: "/products/new",
            method: "POST",
            payload: productWithBusinessId,
            type: "addProduct",
          });
        }
      } else {
        // Offline: enqueue action
        enqueueAction({
          endpoint: "/products/new",
          method: "POST",
          payload: productWithBusinessId,
          type: "addProduct",
        });
      }
    },
    [
      products,
      isOnline,
      user?.token,
      user?.businessId,
      enqueueAction,
      refetchProducts,
    ],
  );

  const updateProduct = useCallback(
    async (id: string, product: Partial<Product>) => {
      // Ensure businessId is included if updating
      const productWithBusinessId = {
        ...product,
        businessId: product.businessId || user?.businessId,
      };

      storage.updateProduct(id, productWithBusinessId);
      setProducts(
        products.map((p) =>
          p.id === id
            ? {
                ...p,
                ...productWithBusinessId,
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      );
      // Send to API if online
      if (isOnline && user?.token) {
        try {
          await apiRequest(
            "PUT",
            `/products/${id}/update`,
            productWithBusinessId,
            user.token,
          );
          // Immediately refetch products to ensure consistency
          refetchProducts();
        } catch (error) {
          console.warn("Failed to update product in API:", error);
          // Enqueue for later sync
          enqueueAction({
            endpoint: `/products/${id}/update`,
            method: "PUT",
            payload: productWithBusinessId,
            type: "updateProduct",
          });
        }
      } else {
        // Offline: enqueue action
        enqueueAction({
          endpoint: `/products/${id}/update`,
          method: "PUT",
          payload: product,
          type: "updateProduct",
        });
      }
    },
    [products, isOnline, user?.token, enqueueAction, refetchProducts],
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
    async (supplier: Supplier) => {
      // Ensure businessId is included
      const supplierWithBusinessId = {
        ...supplier,
        businessId: supplier.businessId || user?.businessId,
      };

      storage.addSupplier(supplierWithBusinessId);
      setSuppliers([...suppliers, supplierWithBusinessId]);
      // Send to API if online
      if (isOnline && user?.token) {
        try {
          await apiRequest(
            "POST",
            "/suppliers/create",
            supplierWithBusinessId,
            user.token,
          );
          // Immediately refetch suppliers to ensure consistency
          refetchSuppliers();
        } catch (error) {
          console.warn("Failed to save supplier to API:", error);
          // Enqueue for later sync
          enqueueAction({
            endpoint: "/suppliers/create",
            method: "POST",
            payload: supplierWithBusinessId,
            type: "addSupplier",
          });
        }
      } else {
        // Offline: enqueue action
        enqueueAction({
          endpoint: "/suppliers/create",
          method: "POST",
          payload: supplierWithBusinessId,
          type: "addSupplier",
        });
      }
    },
    [
      suppliers,
      isOnline,
      user?.token,
      user?.businessId,
      enqueueAction,
      refetchSuppliers,
    ],
  );

  const updateSupplier = useCallback(
    async (id: string, supplier: Partial<Supplier>) => {
      // Ensure businessId is included if updating
      const supplierWithBusinessId = {
        ...supplier,
        businessId: supplier.businessId || user?.businessId,
      };

      storage.updateSupplier(id, supplierWithBusinessId);
      setSuppliers(
        suppliers.map((s) =>
          s.id === id
            ? {
                ...s,
                ...supplierWithBusinessId,
                updatedAt: new Date().toISOString(),
              }
            : s,
        ),
      );
      // Send to API if online
      if (isOnline && user?.token) {
        try {
          await apiRequest(
            "PUT",
            `/suppliers/${id}/update`,
            supplierWithBusinessId,
            user.token,
          );
          // Immediately refetch suppliers to ensure consistency
          refetchSuppliers();
        } catch (error) {
          console.warn("Failed to update supplier in API:", error);
          // Enqueue for later sync
          enqueueAction({
            endpoint: `/suppliers/${id}/update`,
            method: "PUT",
            payload: supplierWithBusinessId,
            type: "updateSupplier",
          });
        }
      } else {
        // Offline: enqueue action
        enqueueAction({
          endpoint: `/suppliers/${id}/update`,
          method: "PUT",
          payload: supplierWithBusinessId,
          type: "updateSupplier",
        });
      }
    },
    [
      suppliers,
      isOnline,
      user?.token,
      user?.businessId,
      enqueueAction,
      refetchSuppliers,
    ],
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
      // Ensure businessId is included
      const saleWithBusinessId = {
        ...sale,
        businessId: sale.businessId || user?.businessId,
      };

      storage.addSale(saleWithBusinessId);
      // Send to API if online
      if (isOnline && user?.token) {
        try {
          await apiRequest(
            "POST",
            "/sales/create",
            saleWithBusinessId,
            user.token,
          );
          // Immediately refetch products and sales to reflect stock changes
          refetchProducts();
          refetchSales();
        } catch (error) {
          console.warn("Failed to save sale to API:", error);
          // Enqueue for later sync
          enqueueAction({
            endpoint: "/sales/create",
            method: "POST",
            payload: saleWithBusinessId,
            type: "addSale",
          });
        }
      } else {
        // Offline: enqueue action
        enqueueAction({
          endpoint: "/sales/create",
          method: "POST",
          payload: saleWithBusinessId,
          type: "addSale",
        });
      }
    },
    [
      user?.token,
      user?.businessId,
      isOnline,
      enqueueAction,
      refetchProducts,
      refetchSales,
    ],
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
  const addStockMovement = useCallback(
    async (movement: StockMovement) => {
      // Ensure businessId is included
      const movementWithBusinessId = {
        ...movement,
        businessId: movement.businessId || user?.businessId,
      };

      storage.addStockMovement(movementWithBusinessId);
      // Send to API if online
      if (isOnline && user?.token) {
        try {
          await apiRequest(
            "POST",
            "/inventory/movement",
            movementWithBusinessId,
            user.token,
          );
          // Immediately refetch products and inventory to reflect stock changes
          refetchProducts();
          refetchInventory();
        } catch (error) {
          console.warn("Failed to save stock movement to API:", error);
          // Enqueue for later sync
          enqueueAction({
            endpoint: "/inventory/movement",
            method: "POST",
            payload: movementWithBusinessId,
            type: "addStockMovement",
          });
        }
      } else {
        // Offline: enqueue action
        enqueueAction({
          endpoint: "/inventory/movement",
          method: "POST",
          payload: movementWithBusinessId,
          type: "addStockMovement",
        });
      }
      // Always refetch locally
      refetchProducts();
      refetchInventory();
    },
    [
      user?.token,
      user?.businessId,
      isOnline,
      enqueueAction,
      refetchProducts,
      refetchInventory,
    ],
  );

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
