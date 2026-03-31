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
import { useAuth } from "./AuthContext";
import { apiRequest } from "@/lib/queryClient";

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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from storage on mount
  useEffect(() => {
    const loadData = () => {
      if (storage.getProducts() && Array.isArray(storage.getProducts())) {
        setProducts(storage.getProducts());
      } else {
        setProducts([]);
      }

      setSales(storage.getSales());
      setStockMovements(storage.getStockMovements());
      setIsInitialized(true);

      setSuppliers(storage.getSuppliers() || []);
    };

    loadData();
  }, []);

  // Poll suppliers from API every 5 seconds
  const { data: suppliersData } = useQuery({
    queryKey: ["suppliers", "all", user?.token],
    queryFn: () => apiSuppliers(user?.token),
    enabled: !!user?.token && isInitialized,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Poll products from API every 5 seconds
  const { data: productsData } = useQuery({
    queryKey: ["products", "all", user?.token],
    queryFn: () => apiProducts(user?.token),
    enabled: !!user?.token && isInitialized,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Poll inventory movements from API every 5 seconds
  const { data: inventoryData } = useQuery({
    queryKey: ["inventory", "movements", user?.token],
    queryFn: () => apiInventory(user?.token),
    enabled: !!user?.token && isInitialized,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Poll sales from API every 5 seconds
  const { data: salesData } = useQuery({
    queryKey: ["sales", "all", user?.token],
    queryFn: () => apiSales(user?.token),
    enabled: !!user?.token && isInitialized,
    refetchInterval: 5000, // Poll every 5 seconds
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
      // Send to API
      try {
        await apiRequest("POST", "/sales/create", sale, user?.token);
      } catch (error) {
        console.warn("Failed to save sale to API:", error);
      }
      // Refresh will reload both products (with decremented stock) and sales
      refresh();
    },
    [refresh, user?.token],
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
    (movement: StockMovement) => {
      storage.addStockMovement(movement);
      // Refresh will reload products and stock movements
      refresh();
    },
    [refresh],
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

  if (!isInitialized) {
    return <>{children}</>;
  }

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
