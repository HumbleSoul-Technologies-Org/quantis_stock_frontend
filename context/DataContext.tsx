"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  Product,
  Supplier,
  Sale,
  SaleReturn,
  StockMovement,
} from "@/lib/types";
import { storage } from "@/lib/storage";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isNetworkError } from "@/lib/errors";
import { useAuth } from "./AuthContext";
import { useOfflineSync } from "@/hooks/useOfflineSync";

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

      return data || [];
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

      return data || [];
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
      return (data && data.movements) || data || [];
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

  // Poll suppliers from API every 90 seconds (static data, rarely updated)
  const { data: suppliersData, refetch: refetchSuppliers } = useQuery({
    queryKey: ["suppliers", user?.businessId],
    queryFn: () => apiSuppliers(user?.token, user?.businessId),
    enabled: !!user?.token && !!user?.businessId && isInitialized,
    staleTime: 3000, // 3 seconds - prevent cache thrashing
    refetchInterval: 90000, // Poll every 90 seconds (low change frequency)
    refetchIntervalInBackground: true, // Continue polling when window loses focus
  });

  // Poll products from API every 30 seconds (moderate volatility - pricing/stock)
  const { data: productsData, refetch: refetchProducts } = useQuery({
    queryKey: ["products", user?.businessId],
    queryFn: () => apiProducts(user?.token, user?.businessId),
    enabled: !!user?.token && !!user?.businessId && isInitialized,
    staleTime: 3000, // 3 seconds - prevent cache thrashing
    refetchInterval: 30000, // Poll every 30 seconds (moderate importance)
    refetchIntervalInBackground: true, // Continue polling when window loses focus
  });

  // Poll inventory movements from API every 20 seconds (critical for stock accuracy)
  const { data: inventoryData, refetch: refetchInventory } = useQuery({
    queryKey: ["inventory", "movements", user?.businessId],
    queryFn: () => apiInventory(user?.token, user?.businessId),
    enabled: !!user?.token && !!user?.businessId && isInitialized,
    staleTime: 3000, // 3 seconds - prevent cache thrashing
    refetchInterval: 20000, // Poll every 20 seconds (prevent overselling)
    refetchIntervalInBackground: true, // Continue polling when window loses focus
  });

  // Poll sales from API every 15 seconds (business-critical, revenue tracking)
  const { data: salesData, refetch: refetchSales } = useQuery({
    queryKey: ["sales", user?.businessId],
    queryFn: () => apiSales(user?.token, user?.businessId),
    enabled: !!user?.token && !!user?.businessId && isInitialized,
    staleTime: 3000, // 3 seconds - prevent cache thrashing
    refetchInterval: 15000, // Poll every 15 seconds (highest priority)
    refetchIntervalInBackground: true, // Continue polling when window loses focus
  });

  // Update state when API data changes
  useEffect(() => {
    if (suppliersData) {
      setSuppliers(suppliersData || []);
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
          // Immediately invalidate products cache for instant refresh
          await queryClient.invalidateQueries({
            queryKey: ["products", user?.businessId],
          });
        } catch (error) {
          console.warn("Failed to save product to API:", error);
          // Only enqueue if it's a network error, not API error
          if (isNetworkError(error)) {
            enqueueAction({
              endpoint: "/products/new",
              method: "POST",
              payload: productWithBusinessId,
              type: "addProduct",
            });
          } else {
            // For API errors, remove from local state since sync failed
            setProducts(products.filter((p) => p.id !== product.id));
            throw error; // Re-throw so caller can handle it
          }
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
    [products, isOnline, user?.token, user?.businessId, enqueueAction],
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
          p.id === id || (p as any)._id === id
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
          // Immediately invalidate products cache for instant refresh
          await queryClient.invalidateQueries({
            queryKey: ["products", user?.businessId],
          });
        } catch (error) {
          console.warn("Failed to update product in API:", error);
          // Only enqueue if it's a network error, not API error
          if (isNetworkError(error)) {
            enqueueAction({
              endpoint: `/products/${id}/update`,
              method: "PUT",
              payload: productWithBusinessId,
              type: "updateProduct",
            });
          } else {
            throw error; // Re-throw so caller can handle it
          }
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
    [products, isOnline, user?.token, user?.businessId, enqueueAction],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      // Optimistically update local state
      storage.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id && (p as any)._id !== id));

      // Send to API if online
      if (isOnline && user?.token) {
        try {
          await apiRequest("DELETE", `/products/${id}/delete`, {}, user.token);
          // Immediately invalidate products cache for instant refresh
          await queryClient.invalidateQueries({
            queryKey: ["products", user?.businessId],
          });
        } catch (error) {
          console.warn("Failed to delete product from API:", error);
          // Only enqueue if it's a network error, not API error
          if (isNetworkError(error)) {
            enqueueAction({
              endpoint: `/products/${id}/delete`,
              method: "DELETE",
              payload: {},
              type: "deleteProduct",
            });
          } else {
            // Revert optimistic update on API error
            const state = storage.getState();
            setProducts(state.products);
            throw error; // Re-throw so caller can handle it
          }
        }
      } else {
        // Offline: enqueue action
        enqueueAction({
          endpoint: `/products/${id}/delete`,
          method: "DELETE",
          payload: {},
          type: "deleteProduct",
        });
      }
    },
    [products, isOnline, user?.token, user?.businessId, enqueueAction],
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
          // Immediately invalidate suppliers cache for instant refresh
          await queryClient.invalidateQueries({
            queryKey: ["suppliers", user?.businessId],
          });
        } catch (error) {
          console.warn("Failed to save supplier to API:", error);
          // Only enqueue if it's a network error, not API error
          if (isNetworkError(error)) {
            enqueueAction({
              endpoint: "/suppliers/create",
              method: "POST",
              payload: supplierWithBusinessId,
              type: "addSupplier",
            });
          } else {
            setSuppliers(suppliers.filter((s) => s.id !== supplier.id));
            throw error; // Re-throw so caller can handle it
          }
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
    [suppliers, isOnline, user?.token, user?.businessId, enqueueAction],
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
          s.id === id || (s as any)._id === id
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
          // Immediately invalidate suppliers cache for instant refresh
          await queryClient.invalidateQueries({
            queryKey: ["suppliers", user?.businessId],
          });
        } catch (error) {
          console.warn("Failed to update supplier in API:", error);
          // Only enqueue if it's a network error, not API error
          if (isNetworkError(error)) {
            enqueueAction({
              endpoint: `/suppliers/${id}/update`,
              method: "PUT",
              payload: supplierWithBusinessId,
              type: "updateSupplier",
            });
          } else {
            throw error; // Re-throw so caller can handle it
          }
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
    [suppliers, isOnline, user?.token, user?.businessId, enqueueAction],
  );

  const deleteSupplier = useCallback(
    async (id: string) => {
      // Optimistically update local state
      storage.deleteSupplier(id);
      setSuppliers(
        suppliers.filter((s) => s.id !== id && (s as any)._id !== id),
      );

      // Send to API if online
      if (isOnline && user?.token) {
        try {
          await apiRequest("DELETE", `/suppliers/${id}/delete`, {}, user.token);
          // Immediately invalidate suppliers cache for instant refresh
          await queryClient.invalidateQueries({
            queryKey: ["suppliers", user?.businessId],
          });
        } catch (error) {
          console.warn("Failed to delete supplier from API:", error);
          // Only enqueue if it's a network error, not API error
          if (isNetworkError(error)) {
            enqueueAction({
              endpoint: `/suppliers/${id}/delete`,
              method: "DELETE",
              payload: {},
              type: "deleteSupplier",
            });
          } else {
            // Revert optimistic update on API error
            const state = storage.getState();
            setSuppliers(state.suppliers);
            throw error; // Re-throw so caller can handle it
          }
        }
      } else {
        // Offline: enqueue action
        enqueueAction({
          endpoint: `/suppliers/${id}/delete`,
          method: "DELETE",
          payload: {},
          type: "deleteSupplier",
        });
      }
    },
    [suppliers, isOnline, user?.token, user?.businessId, enqueueAction],
  );

  // Sales
  const addSale = useCallback(
    async (sale: Sale) => {
      // Ensure businessId is included
      const saleWithBusinessId = {
        ...sale,
        businessId: sale.businessId || user?.businessId,
      };

      // Save locally immediately and update UI optimistically
      storage.addSale(saleWithBusinessId);
      setSales((prev) => [...prev, saleWithBusinessId]);

      // Update products stock levels and create stock movements optimistically
      const updatedProducts = products.map((product) => {
        const saleItem = saleWithBusinessId.items.find(
          (item) =>
            item.productId === product.id ||
            item.productId === (product as any)._id,
        );
        if (saleItem) {
          return {
            ...product,
            currentStock: product.currentStock - saleItem.quantity,
          };
        }
        return product;
      });
      setProducts(updatedProducts);

      // Add stock movements optimistically
      const newMovements: StockMovement[] = saleWithBusinessId.items.map(
        (item) => ({
          id: Math.random().toString(36).substr(2, 9),
          productId: item.productId,
          type: "out" as const,
          quantity: item.quantity,
          reason: "Sale",
          reference: saleWithBusinessId.saleNumber,
          createdBy: user?.id || user?._id || "system",
          createdAt: new Date().toISOString(),
        }),
      );
      setStockMovements((prev) => [...prev, ...newMovements]);

      // Update React Query cache
      queryClient.setQueryData(
        ["sales", user?.businessId],
        (oldData: Sale[] | undefined) =>
          oldData ? [...oldData, saleWithBusinessId] : [saleWithBusinessId],
      );
      queryClient.setQueryData(
        ["products", user?.businessId],
        (oldData: Product[] | undefined) => updatedProducts,
      );
      queryClient.setQueryData(
        ["inventory", "movements", user?.businessId],
        (oldData: StockMovement[] | undefined) =>
          oldData ? [...oldData, ...newMovements] : newMovements,
      );

      // Send to API if online
      if (isOnline && user?.token) {
        try {
          await apiRequest(
            "POST",
            "/sales/create",
            saleWithBusinessId,
            user.token,
          );
          // Force cache invalidation to ensure consistency
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
          ]);
        } catch (error) {
          console.warn("Failed to save sale to API:", error);
          // Only enqueue if it's a network error, not API error
          if (isNetworkError(error)) {
            enqueueAction({
              endpoint: "/sales/create",
              method: "POST",
              payload: saleWithBusinessId,
              type: "addSale",
            });
          } else {
            throw error; // Re-throw so caller can handle it
          }
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

      // Always try to invalidate locally cached data after optimistic update
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
      isOnline,
      enqueueAction,
      products,
      stockMovements,
    ],
  );

  const updateSale = useCallback(
    async (id: string, sale: Partial<Sale>) => {
      // Ensure businessId is included if updating
      const saleWithBusinessId = {
        ...sale,
        businessId: sale.businessId || user?.businessId,
      };

      // Optimistically update local state
      storage.updateSale(id, saleWithBusinessId);
      setSales(
        sales.map((s) =>
          s.id === id || (s as any)._id === id
            ? {
                ...s,
                ...saleWithBusinessId,
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
            `/sales/${id}/update`,
            saleWithBusinessId,
            user.token,
          );
          // Immediately refetch sales to ensure consistency
          refetchSales();
        } catch (error) {
          console.warn("Failed to update sale in API:", error);
          // Only enqueue if it's a network error, not API error
          if (isNetworkError(error)) {
            enqueueAction({
              endpoint: `/sales/${id}/update`,
              method: "PUT",
              payload: saleWithBusinessId,
              type: "updateSale",
            });
          } else {
            // Revert optimistic update on API error
            const state = storage.getState();
            setSales(state.sales);
            throw error; // Re-throw so caller can handle it
          }
        }
      } else {
        // Offline: enqueue action
        enqueueAction({
          endpoint: `/sales/${id}/update`,
          method: "PUT",
          payload: saleWithBusinessId,
          type: "updateSale",
        });
      }
    },
    [
      sales,
      isOnline,
      user?.token,
      user?.businessId,
      enqueueAction,
      refetchSales,
    ],
  );

  const deleteSale = useCallback(
    async (id: string) => {
      // Optimistically update local state
      storage.deleteSale(id);
      setSales(sales.filter((s) => s.id !== id && (s as any)._id !== id));

      // Send to API if online
      if (isOnline && user?.token) {
        try {
          await apiRequest("DELETE", `/sales/${id}/delete`, {}, user.token);
          // Immediately refetch sales to ensure consistency
          refetchSales();
        } catch (error) {
          console.warn("Failed to delete sale from API:", error);
          // Only enqueue if it's a network error, not API error
          if (isNetworkError(error)) {
            enqueueAction({
              endpoint: `/sales/${id}/delete`,
              method: "DELETE",
              payload: {},
              type: "deleteSale",
            });
          } else {
            // Revert optimistic update on API error
            const state = storage.getState();
            setSales(state.sales);
            throw error; // Re-throw so caller can handle it
          }
        }
      } else {
        // Offline: enqueue action
        enqueueAction({
          endpoint: `/sales/${id}/delete`,
          method: "DELETE",
          payload: {},
          type: "deleteSale",
        });
      }
    },
    [sales, isOnline, user?.token, enqueueAction, refetchSales],
  );

  // Sale Returns
  const processSaleReturn = useCallback(
    async (saleReturn: SaleReturn) => {
      // Ensure businessId is included
      const returnWithBusinessId = {
        ...saleReturn,
        businessId: saleReturn.businessId || user?.businessId,
      };

      // Save locally immediately and update UI optimistically
      storage.processSaleReturn(returnWithBusinessId);

      // Find the original sale to update its return status
      const originalSale = sales.find(
        (s) =>
          s.id === returnWithBusinessId.saleId ||
          s._id === returnWithBusinessId.saleId,
      );

      // Update products stock levels optimistically (add back returned quantities)
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
      setProducts(updatedProducts);

      // Add stock movements optimistically
      const newMovements: StockMovement[] = returnWithBusinessId.items.map(
        (item) => ({
          id: Math.random().toString(36).substr(2, 9),
          productId: item.productId,
          type: "in" as const,
          quantity: item.quantity,
          reason: "Return",
          reference:
            returnWithBusinessId.reference || originalSale?.saleNumber || "",
          createdBy: user?.id || user?._id || "system",
          createdAt: new Date().toISOString(),
        }),
      );
      setStockMovements((prev) => [...prev, ...newMovements]);

      // Update the original sale's return status optimistically
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

      // Update React Query cache
      queryClient.setQueryData(
        ["products", user?.businessId],
        (oldData: Product[] | undefined) => updatedProducts,
      );
      queryClient.setQueryData(
        ["inventory", "movements", user?.businessId],
        (oldData: StockMovement[] | undefined) =>
          oldData ? [...oldData, ...newMovements] : newMovements,
      );
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

      // Send to API if online
      if (isOnline && user?.token) {
        try {
          await apiRequest(
            "POST",
            "/sales/return",
            returnWithBusinessId,
            user.token,
          );
          // Force cache invalidation to ensure consistency
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
          ]);
        } catch (error) {
          console.warn("Failed to save return to API:", error);
          // Only enqueue if it's a network error, not API error
          if (isNetworkError(error)) {
            enqueueAction({
              endpoint: "/sales/return",
              method: "POST",
              payload: returnWithBusinessId,
              type: "processSaleReturn",
            });
          } else {
            throw error; // Re-throw so caller can handle it
          }
        }
      } else {
        // Offline: enqueue action
        enqueueAction({
          endpoint: "/sales/return",
          method: "POST",
          payload: returnWithBusinessId,
          type: "processSaleReturn",
        });
      }

      // Always try to invalidate locally cached data after optimistic update
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
      isOnline,
      enqueueAction,
      products,
      stockMovements,
      sales,
    ],
  );

  // Stock Movements
  const addStockMovement = useCallback(
    async (movement: StockMovement) => {
      // Ensure businessId is included
      const movementWithBusinessId = {
        ...movement,
        businessId: movement.businessId || user?.businessId,
      };

      // Save locally immediately and update UI optimistically
      storage.addStockMovement(movementWithBusinessId);
      setStockMovements((prev) => [...prev, movementWithBusinessId]);
      setProducts((prev) =>
        prev.map((product) => {
          if (
            product.id === movementWithBusinessId.productId ||
            (product as any)._id === movementWithBusinessId.productId
          ) {
            const adjustedStock =
              movementWithBusinessId.type === "in"
                ? product.currentStock + movementWithBusinessId.quantity
                : movementWithBusinessId.type === "out"
                  ? product.currentStock - movementWithBusinessId.quantity
                  : movementWithBusinessId.quantity;

            return { ...product, currentStock: adjustedStock };
          }
          return product;
        }),
      );

      queryClient.setQueryData(
        ["inventory", "movements", user?.businessId],
        (oldData: StockMovement[] | undefined) =>
          oldData
            ? [...oldData, movementWithBusinessId]
            : [movementWithBusinessId],
      );
      queryClient.setQueryData(
        ["products", user?.businessId],
        (oldData: Product[] | undefined) =>
          oldData
            ? oldData.map((product) => {
                if (
                  product.id === movementWithBusinessId.productId ||
                  (product as any)._id === movementWithBusinessId.productId
                ) {
                  const adjustedStock =
                    movementWithBusinessId.type === "in"
                      ? product.currentStock + movementWithBusinessId.quantity
                      : movementWithBusinessId.type === "out"
                        ? product.currentStock - movementWithBusinessId.quantity
                        : movementWithBusinessId.quantity;

                  return { ...product, currentStock: adjustedStock };
                }
                return product;
              })
            : undefined,
      );

      // Send to API if online
      if (isOnline && user?.token) {
        try {
          await apiRequest(
            "POST",
            "/inventory/movement",
            movementWithBusinessId,
            user?.token,
          );
          // Force cache invalidation to immediately reflect stock changes
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: ["products", user?.businessId],
            }),
            queryClient.invalidateQueries({
              queryKey: ["inventory", "movements", user?.businessId],
            }),
          ]);
        } catch (error) {
          console.warn("Failed to save stock movement to API:", error);
          // Only enqueue if it's a network error, not API error
          if (isNetworkError(error)) {
            enqueueAction({
              endpoint: "/inventory/movement",
              method: "POST",
              payload: movementWithBusinessId,
              type: "addStockMovement",
            });
          } else {
            throw error; // Re-throw so caller can handle it
          }
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

      // Always try to invalidate locally cached data after optimistic update
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["products", user?.businessId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["inventory", "movements", user?.businessId],
        }),
      ]).catch(() => {
        // Continue even if invalidation fails
      });
    },
    [user?.token, user?.businessId, isOnline, enqueueAction],
  );

  // Utilities
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
        (m) => m.productId === productId || m._id === productId,
      ),
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
        processSaleReturn,
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
