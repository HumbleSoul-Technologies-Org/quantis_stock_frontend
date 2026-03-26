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
  addSale: (sale: Sale) => void;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from storage on mount
  useEffect(() => {
    const loadData = () => {
      setProducts(storage.getProducts());
      setSuppliers(storage.getSuppliers());
      setSales(storage.getSales());
      setStockMovements(storage.getStockMovements());
      setIsInitialized(true);
    };

    loadData();
  }, []);

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
    (sale: Sale) => {
      storage.addSale(sale);
      // Refresh will reload both products (with decremented stock) and sales
      refresh();
    },
    [refresh],
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
    (id: string) => products.find((p) => p.id === id),
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
