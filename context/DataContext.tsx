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
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/hooks/useToast";

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
      return data || [];
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

  // Utilities
  getProductById: (id: string) => Product | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
  getSalesForUser: (userId: string) => Sale[];
  getProductStockHistory: (productId: string) => StockMovement[];
  refresh: () => void;
  refetchData: () => Promise<void>;
  refetchProducts: () => Promise<any>;
  refetchInventory: () => Promise<any>;

  // No Internet Modal
  showNoInternetModal: boolean;
  noInternetModalActionType: string;
  closeNoInternetModal: () => void;
  continueLocally: () => void;
  openNoInternetModal: (actionType: string, action: () => void) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { isOnline, enqueueAction } = useOfflineSync(
    settings?.syncData,
    user?.token,
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleReturns, setSaleReturns] = useState<SaleReturn[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // No internet modal state
  const [showNoInternetModal, setShowNoInternetModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: string;
    action: () => void;
  } | null>(null);
  const [skipNextOfflineModalType, setSkipNextOfflineModalType] = useState<
    string | null
  >(null);

  const { success: toastSuccess } = useToast();

  // Handle continuing with local-only action
  const handleContinueLocally = useCallback(() => {
    if (pendingAction) {
      setSkipNextOfflineModalType(pendingAction.type);
      pendingAction.action();
      setShowNoInternetModal(false);
      setPendingAction(null);
      toastSuccess(
        "Action completed locally. Data will not sync until offline mode is enabled.",
        5000,
      );
    }
  }, [pendingAction, toastSuccess]);

  // Check if should show no internet modal
  const openNoInternetModal = useCallback(
    (actionType: string, action: () => void) => {
      if (skipNextOfflineModalType === actionType) {
        setSkipNextOfflineModalType(null);
        return false;
      }

      if (!settings?.syncData?.offlineMode && !isOnline) {
        setPendingAction({ type: actionType, action });
        setShowNoInternetModal(true);
        return true;
      }
      return false;
    },
    [settings?.syncData?.offlineMode, isOnline, skipNextOfflineModalType],
  );

  const mergeServerDataWithLocal = useCallback(
    <T extends { id?: string; _id?: string }>(
      serverItems: T[],
      offlineItems: T[],
    ): T[] => {
      if (!offlineItems || offlineItems.length === 0) {
        return serverItems;
      }

      const merged = [...serverItems];

      offlineItems.forEach((offlineItem) => {
        const exists = merged.some(
          (item) =>
            item.id === offlineItem.id ||
            item._id === offlineItem._id ||
            item.id === offlineItem._id ||
            item._id === offlineItem.id,
        );
        if (!exists) {
          merged.push(offlineItem);
        }
      });

      return merged;
    },
    [],
  );

  const refresh = useCallback(() => {
    const offlineItems = storage.getOfflineItems();
    setProducts(
      mergeServerDataWithLocal(storage.getProducts(), offlineItems.products),
    );
    setSuppliers(
      mergeServerDataWithLocal(storage.getSuppliers(), offlineItems.suppliers),
    );
    setSales(mergeServerDataWithLocal(storage.getSales(), offlineItems.sales));
    setSaleReturns(
      mergeServerDataWithLocal(
        storage.getSaleReturns(),
        offlineItems.saleReturns,
      ),
    );
    setStockMovements(
      mergeServerDataWithLocal(
        storage.getStockMovements(),
        offlineItems.stockMovements,
      ),
    );
  }, [mergeServerDataWithLocal]);

  // Initialize from storage on mount - merge synced items with offline items
  useEffect(() => {
    const loadData = () => {
      const state = storage.getState();
      const offlineItems = storage.getOfflineItems();

      // Merge synced items with offline items
      const mergedProducts = mergeServerDataWithLocal(
        Array.isArray(state.products) ? state.products : [],
        Array.isArray(offlineItems.products) ? offlineItems.products : [],
      );
      const mergedSuppliers = mergeServerDataWithLocal(
        Array.isArray(state.suppliers) ? state.suppliers : [],
        Array.isArray(offlineItems.suppliers) ? offlineItems.suppliers : [],
      );
      const mergedSales = mergeServerDataWithLocal(
        Array.isArray(state.sales) ? state.sales : [],
        Array.isArray(offlineItems.sales) ? offlineItems.sales : [],
      );
      const mergedSaleReturns = mergeServerDataWithLocal(
        Array.isArray(state.saleReturns) ? state.saleReturns : [],
        Array.isArray(offlineItems.saleReturns) ? offlineItems.saleReturns : [],
      );
      const mergedStockMovements = mergeServerDataWithLocal(
        Array.isArray(state.stockMovements) ? state.stockMovements : [],
        Array.isArray(offlineItems.stockMovements)
          ? offlineItems.stockMovements
          : [],
      );

      setProducts(mergedProducts);
      setSales(mergedSales);
      setSaleReturns(mergedSaleReturns);
      setStockMovements(mergedStockMovements);
      setSuppliers(mergedSuppliers);
      setIsInitialized(true);
    };

    loadData();
  }, [mergeServerDataWithLocal]);

  // Poll suppliers from API every 30 seconds (moderate volatility - supplier edits)
  const { data: suppliersData, refetch: refetchSuppliers } = useQuery({
    queryKey: ["suppliers", user?.businessId],
    queryFn: () => apiSuppliers(user?.token, user?.businessId),
    enabled: !!user?.token && !!user?.businessId && isInitialized,
    staleTime: 3000, // 3 seconds - prevent cache thrashing
    refetchInterval: 30000, // Poll every 30 seconds (match products polling)
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

  // Poll sale returns from API every 30 seconds (moderate priority - historical data)
  const { data: saleReturnsData, refetch: refetchSaleReturns } = useQuery({
    queryKey: ["sales", "returns", user?.businessId],
    queryFn: () => apiSaleReturns(user?.token, user?.businessId),
    enabled: !!user?.token && !!user?.businessId && isInitialized,
    staleTime: 3000, // 3 seconds - prevent cache thrashing
    refetchInterval: 30000, // Poll every 30 seconds (moderate priority)
    refetchIntervalInBackground: true, // Continue polling when window loses focus
  });

  // Update state when API data changes
  useEffect(() => {
    if (suppliersData !== undefined && suppliersData !== null) {
      const offlineItems = storage.getOfflineItems();
      const mergedSuppliers = mergeServerDataWithLocal(
        suppliersData,
        offlineItems.suppliers,
      );
      setSuppliers(mergedSuppliers);
      // Save only server data to main storage
      const state = storage.getState();
      state.suppliers = suppliersData;
      storage.saveState(state);
    }
  }, [suppliersData, mergeServerDataWithLocal]);

  useEffect(() => {
    if (productsData !== undefined && productsData !== null) {
      const offlineItems = storage.getOfflineItems();
      const mergedProducts = mergeServerDataWithLocal(
        productsData,
        offlineItems.products,
      );
      setProducts(mergedProducts);
      // Save only server data to main storage
      const state = storage.getState();
      state.products = productsData;
      storage.saveState(state);
    }
  }, [productsData, mergeServerDataWithLocal]);

  useEffect(() => {
    if (inventoryData !== undefined && inventoryData !== null) {
      const offlineItems = storage.getOfflineItems();
      const mergedStockMovements = mergeServerDataWithLocal(
        inventoryData,
        offlineItems.stockMovements,
      );
      setStockMovements(mergedStockMovements);
      // Save only server data to main storage
      const state = storage.getState();
      state.stockMovements = inventoryData;
      storage.saveState(state);
    }
  }, [inventoryData, mergeServerDataWithLocal]);

  useEffect(() => {
    if (salesData !== undefined && salesData !== null) {
      const offlineItems = storage.getOfflineItems();
      const mergedSales = mergeServerDataWithLocal(
        salesData,
        offlineItems.sales,
      );
      setSales(mergedSales);
      // Save only server data to main storage
      const state = storage.getState();
      state.sales = salesData;
      storage.saveState(state);
    }
  }, [salesData, mergeServerDataWithLocal]);

  useEffect(() => {
    if (saleReturnsData !== undefined && saleReturnsData !== null) {
      const offlineItems = storage.getOfflineItems();
      const mergedSaleReturns = mergeServerDataWithLocal(
        saleReturnsData,
        offlineItems.saleReturns,
      );
      setSaleReturns(mergedSaleReturns);
      // Save only server data to main storage
      const state = storage.getState();
      state.saleReturns = saleReturnsData;
      storage.saveState(state);
    }
  }, [saleReturnsData, mergeServerDataWithLocal]);

  // Refetch data from API immediately (for instant updates after creating records)
  const refetchData = useCallback(async () => {
    await Promise.all([
      refetchProducts(),
      refetchSuppliers(),
      refetchInventory(),
      refetchSales(),
      refetchSaleReturns(),
    ]);
  }, [
    refetchProducts,
    refetchSuppliers,
    refetchInventory,
    refetchSales,
    refetchSaleReturns,
  ]);

  // Utility functions for sale returns
  const getSaleReturns = useCallback(() => saleReturns, [saleReturns]);
  const getSaleReturnById = useCallback(
    (id: string) => {
      return saleReturns.find((r) => r.id === id || (r as any)._id === id);
    },
    [saleReturns],
  );

  // Products
  const addProduct = useCallback(
    async (product: Product) => {
      // Ensure businessId is included and generate ID if missing
      const productWithBusinessId = {
        ...product,
        id: product.id || uuidv4(), // Generate UUID if no ID
        businessId: product.businessId || user?.businessId,
      };

      console.log(
        "📝 [DATACONTEXT] addProduct - generated/existing ID:",
        productWithBusinessId.id,
      );

      const localAction = () => {
        // Save to offline store if offline, otherwise to main store
        if (isOnline) {
          storage.addProduct(productWithBusinessId);
        } else {
          storage.addOfflineProduct(productWithBusinessId);
        }
        setProducts([...products, productWithBusinessId]);
      };

      if (openNoInternetModal("create product", localAction)) {
        return;
      }

      // Proceed with normal action
      localAction();

      // Send to API if online
      enqueueAction({
        endpoint: "/products/new",
        method: "POST",
        payload: productWithBusinessId,
        type: "CREATE_PRODUCT",
      });
    },
    [
      products,
      isOnline,
      user?.token,
      user?.businessId,
      enqueueAction,
      openNoInternetModal,
    ],
  );

  const updateProduct = useCallback(
    async (id: string, product: Partial<Product>) => {
      const productWithBusinessId = {
        ...product,
        businessId: product.businessId || user?.businessId,
      };

      const localAction = () => {
        storage.updateProduct(id, productWithBusinessId as Product);
        setProducts(
          products.map((p: any) =>
            p.id === id || (p as any)._id === id
              ? {
                  ...p,
                  ...productWithBusinessId,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
        );
      };

      if (openNoInternetModal("update product", localAction)) {
        return;
      }

      localAction();
      enqueueAction({
        endpoint: `/products/${id}/update`,
        method: "PUT",
        payload: productWithBusinessId,
        type: "UPDATE_PRODUCT",
      });
    },
    [
      products,
      isOnline,
      user?.token,
      user?.businessId,
      enqueueAction,
      openNoInternetModal,
    ],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const localAction = () => {
        storage.deleteProduct(id);
        setProducts(
          products.filter((p) => p.id !== id && (p as any)._id !== id),
        );
      };

      if (openNoInternetModal("delete product", localAction)) {
        return;
      }

      localAction();
      enqueueAction({
        endpoint: `/products/${id}/delete`,
        method: "DELETE",
        payload: {},
        type: "DELETE_PRODUCT",
      });
    },
    [
      products,
      isOnline,
      user?.token,
      user?.businessId,
      enqueueAction,
      openNoInternetModal,
    ],
  );

  // Suppliers
  const addSupplier = useCallback(
    async (supplier: Supplier) => {
      // Ensure businessId is included
      const supplierWithBusinessId = {
        ...supplier,
        businessId: supplier.businessId || user?.businessId,
      };

      const localAction = () => {
        // Save to offline store if offline, otherwise to main store
        if (isOnline) {
          storage.addSupplier(supplierWithBusinessId);
        } else {
          storage.addOfflineSupplier(supplierWithBusinessId);
        }
        setSuppliers([...suppliers, supplierWithBusinessId]);
      };

      if (openNoInternetModal("create supplier", localAction)) {
        return;
      }

      // Proceed with normal action
      localAction();
      enqueueAction({
        endpoint: "/suppliers/create",
        method: "POST",
        payload: supplierWithBusinessId,
        type: "CREATE_SUPPLIER",
      });
    },
    [
      suppliers,
      isOnline,
      user?.token,
      user?.businessId,
      enqueueAction,
      openNoInternetModal,
      refetchSuppliers,
    ],
  );

  const updateSupplier = useCallback(
    async (id: string, supplier: Partial<Supplier>) => {
      const supplierWithBusinessId = {
        ...supplier,
        businessId: supplier.businessId || user?.businessId,
      };

      const localAction = () => {
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
      };

      if (openNoInternetModal("update supplier", localAction)) {
        return;
      }

      localAction();
      enqueueAction({
        endpoint: `/suppliers/${id}/update`,
        method: "PUT",
        payload: supplierWithBusinessId,
        type: "UPDATE_SUPPLIER",
      });
    },
    [
      suppliers,
      isOnline,
      user?.token,
      user?.businessId,
      enqueueAction,
      refetchSuppliers,
      openNoInternetModal,
    ],
  );

  const deleteSupplier = useCallback(
    async (id: string) => {
      const localAction = () => {
        storage.deleteSupplier(id);
        setSuppliers(
          suppliers.filter((s) => s.id !== id && (s as any)._id !== id),
        );
      };

      if (openNoInternetModal("delete supplier", localAction)) {
        return;
      }

      localAction();
      enqueueAction({
        endpoint: `/suppliers/${id}/delete`,
        method: "DELETE",
        payload: {},
        type: "DELETE_SUPPLIER",
      });
    },
    [
      suppliers,
      isOnline,
      user?.token,
      user?.businessId,
      enqueueAction,
      refetchSuppliers,
      openNoInternetModal,
    ],
  );

  // Sales
  const addSale = useCallback(
    async (sale: Sale) => {
      const saleWithBusinessId = {
        ...sale,
        businessId: sale.businessId || user?.businessId,
      };

      const localAction = () => {
        if (isOnline) {
          storage.addSale(saleWithBusinessId);
        } else {
          storage.addOfflineSale(saleWithBusinessId);
        }
        setSales((prev) => [...prev, saleWithBusinessId]);

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

        const newMovements: StockMovement[] = saleWithBusinessId.items.map(
          (item) => ({
            id: Math.random().toString(36).substr(2, 9),
            productId: item.productId,
            type: "out" as const,
            quantity: item.quantity,
            reason: "Sale",
            reference: `SALE-${saleWithBusinessId.saleNumber}`,
            createdBy: user?.id || user?._id || "system",
            createdAt: new Date().toISOString(),
          }),
        );
        setStockMovements((prev) => [...prev, ...newMovements]);

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
      };

      if (openNoInternetModal("create sale", localAction)) {
        return;
      }

      localAction();
      enqueueAction({
        endpoint: "/sales/create",
        method: "POST",
        payload: saleWithBusinessId,
        type: "CREATE_SALE",
      });

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
      originalMap.set(item.productId, item.quantity);
    });

    updatedItems.forEach((item) => {
      updatedMap.set(item.productId, item.quantity);
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
      };

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
        setProducts(updatedProducts);
        setStockMovements([...updatedStockMovements, ...newMovements]);

        queryClient.setQueryData(
          ["sales", user?.businessId],
          (oldData: Sale[] | undefined) =>
            oldData
              ? oldData.map((s) =>
                  s.id === id || (s as any)._id === id
                    ? {
                        ...s,
                        ...saleWithBusinessId,
                        updatedAt: new Date().toISOString(),
                      }
                    : s,
                )
              : undefined,
        );
      };

      if (openNoInternetModal("update sale", localAction)) {
        return;
      }

      localAction();
      enqueueAction({
        endpoint: `/sales/${id}/update`,
        method: "PUT",
        payload: saleWithBusinessId,
        type: "UPDATE_SALE",
      });
    },
    [
      sales,
      stockMovements,
      products,
      isOnline,
      user?.token,
      user?.businessId,
      user?.id,
      user?._id,
      enqueueAction,
      refetchSales,
      openNoInternetModal,
    ],
  );

  const deleteSale = useCallback(
    async (id: string) => {
      const localAction = () => {
        storage.deleteSale(id);
        setSales(sales.filter((s) => s.id !== id && (s as any)._id !== id));
      };

      if (openNoInternetModal("delete sale", localAction)) {
        return;
      }

      localAction();
      enqueueAction({
        endpoint: `/sales/${id}/delete`,
        method: "DELETE",
        payload: {},
        type: "DELETE_SALE",
      });
    },
    [
      sales,
      isOnline,
      user?.token,
      enqueueAction,
      refetchSales,
      openNoInternetModal,
    ],
  );

  // Sale Returns
  const processSaleReturn = useCallback(
    async (saleReturn: SaleReturn) => {
      const returnWithBusinessId = {
        ...saleReturn,
        businessId: saleReturn.businessId || user?.businessId,
      };

      const localAction = () => {
        if (isOnline) {
          storage.processSaleReturn(returnWithBusinessId);
        } else {
          storage.addOfflineSaleReturn(returnWithBusinessId);
        }

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

      if (openNoInternetModal("process sale return", localAction)) {
        return;
      }

      localAction();
      enqueueAction({
        endpoint: "/sales/return",
        method: "POST",
        payload: returnWithBusinessId,
        type: "PROCESS_SALE_RETURN",
      });

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
      openNoInternetModal,
    ],
  );

  // Stock Movements
  const addStockMovement = useCallback(
    async (movement: StockMovement) => {
      const movementWithBusinessId = {
        ...movement,
        businessId: movement.businessId || user?.businessId,
      };

      const localAction = () => {
        if (isOnline) {
          storage.addStockMovement(movementWithBusinessId);
        } else {
          storage.addOfflineStockMovement(movementWithBusinessId);
        }
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

        queryClient.invalidateQueries({
          queryKey: ["inventory", "movements", user?.businessId],
        });
        queryClient.invalidateQueries({
          queryKey: ["products", user?.businessId],
        });
      };

      if (openNoInternetModal("create stock movement", localAction)) {
        return;
      }

      localAction();
      enqueueAction({
        endpoint: "/inventory/movement",
        method: "POST",
        payload: movementWithBusinessId,
        type: "STOCK_IN",
      });

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
    [
      user?.token,
      user?.businessId,
      isOnline,
      enqueueAction,
      openNoInternetModal,
    ],
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
        saleReturns,
        getSaleReturns,
        getSaleReturnById,
        refetchSaleReturns,
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
        showNoInternetModal,
        noInternetModalActionType: pendingAction?.type || "",
        closeNoInternetModal: () => {
          setShowNoInternetModal(false);
          setPendingAction(null);
        },
        continueLocally: handleContinueLocally,
        openNoInternetModal,
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
