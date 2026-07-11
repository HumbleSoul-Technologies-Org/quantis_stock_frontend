import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/useToast";
import { CreditAPIService } from "@/lib/creditAPI";
import { storage } from "@/lib/storage";

export interface Customer {
  country: string;
  district: string;
  id?: string;
  _id?: string;
  businessId?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  creditLimit: number;
  creditStatus: "approved" | "pending" | "rejected" | "suspended";
  creditScore: number;
  totalPurchases: number;
  outstandingBalance: number;
  totalPaid: number;
  lastPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id?: string;
  _id?: string;
  customerId: string;
  saleId: string;
  businessId?: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  paymentMethod: "cash" | "cheque" | "bank_transfer" | "card" | "other";
  reference?: string;
  notes?: string;
  paymentStatus: "pending" | "paid" | "overdue" | "partial" | "reversed";
  daysOverdue: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditConfig {
  businessId?: string;
  interestRate: number;
  lateFeeType: "fixed" | "percentage";
  lateFeeAmount: number;
  daysDueBeforeOverdue: number;
  autoApprovalLimit: number;
  requireApprovalAboveLimit: boolean;
  defaultPaymentTerm: string;
  creditFeatureEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgingReport {
  agingBuckets: {
    current: {
      amount: number;
      count: number;
      percentage: number;
      sales: any[];
    };
    overdue_1_30: {
      amount: number;
      count: number;
      percentage: number;
      sales: any[];
    };
    overdue_31_60: {
      amount: number;
      count: number;
      percentage: number;
      sales: any[];
    };
    overdue_61_90: {
      amount: number;
      count: number;
      percentage: number;
      sales: any[];
    };
    overdue_90_plus: {
      amount: number;
      count: number;
      percentage: number;
      sales: any[];
    };
  };
  totalOutstanding: number;
  reportDate: string;
  totalRecords: number;
}

export interface CreditMetrics {
  totalCreditSalesAmount: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: string;
  creditSalesCount: number;
  paymentsCount: number;
  overdueCount: number;
  totalOverdueAmount: number;
  activeCustomers: number;
  suspendedCustomers: number;
  averageOutstandingPerCustomer: number;
}

export function useCredit() {
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();

  const online = typeof window !== "undefined" ? window.navigator.onLine : true;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [creditConfig, setCreditConfig] = useState<CreditConfig | null>(null);
  const [isLoadingCredit, setIsLoadingCredit] = useState(false);
  const [creditError, setCreditError] = useState<string | null>(null);

  const apiService = useMemo(() => {
    if (!user?.token || !user?.businessId) {
      return null;
    }
    return new CreditAPIService(user.token, user.businessId);
  }, [user?.token, user?.businessId]);

  // ============================================================
  // CUSTOMER OPERATIONS
  // ============================================================

  const fetchCustomers = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      creditStatus?: string;
      search?: string;
    }) => {
      if (!apiService) return;

      setIsLoadingCredit(true);
      setCreditError(null);

      try {
        const response = await apiService.getCustomers(
          {
            page: params?.page ?? 1,
            limit: params?.limit ?? 100,
            creditStatus: params?.creditStatus,
            search: params?.search,
          },
          user?.token ? user.token : "",
        );

        const customerData = response.data?.data?.customers || [];
        setCustomers(customerData);

        // Cache to localStorage if available
        const state = storage.getState() as any;
        storage.saveState({
          ...state,
          customers: customerData,
        });
      } catch (error: any) {
        setCreditError(error.message || "Failed to fetch customers");

        // Fallback to cached customers
        const cached = ((storage.getState() as any).customers ||
          []) as Customer[];
        setCustomers(cached);
      } finally {
        setIsLoadingCredit(false);
      }
    },
    [apiService],
  );

  const getCustomerById = useCallback(
    async (id: string) => {
      if (!apiService) return null;

      try {
        const response = await apiService.getCustomerById(
          id,
          user?.token ? user.token : "",
        );
        const customer = response.data?.data || null;

        // Update cache/state
        if (customer) {
          setCustomers((prev) => {
            const exists = prev.find(
              (c) => c._id === customer._id || c.id === customer.id,
            );
            if (exists) {
              return prev.map((c) =>
                c._id === customer._id || c.id === customer.id ? customer : c,
              );
            }
            return [customer, ...prev];
          });
        }

        return customer;
      } catch (error: any) {
        setCreditError(error.message || "Failed to fetch customer");
        return null;
      }
    },
    [apiService],
  );

  const addCustomer = useCallback(
    async (customer: Partial<Customer>) => {
      if (!apiService) return;

      const newCustomer: any = {
        ...customer,
      };

      console.log("Adding customer:", newCustomer);

      try {
        const response = await apiService.createCustomer(
          newCustomer,
          user?.token ? user.token : "",
        );
        const serverCustomer = response.data?.data;

        setCustomers((prev) => [serverCustomer, ...prev]);

        success(`Customer ${serverCustomer.name} added successfully`);
      } catch (err: any) {
        setCreditError(err.message);
        toastError("Failed to add customer");
      }
    },
    [apiService, success, toastError],
  );

  const updateCustomer = useCallback(
    async (id: string, updates: Partial<Customer>) => {
      if (!apiService) return;

      // Optimistic update
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === id || c._id === id ? { ...c, ...updates } : c,
        ),
      );

      try {
        const response = await apiService.updateCustomer(
          id,
          updates,
          user?.token ? user.token : "",
        );
        const updated = response.data?.data;

        setCustomers((prev) =>
          prev.map((c) => (c.id === id || c._id === id ? updated : c)),
        );

        success("Customer updated successfully");
      } catch (err: any) {
        setCreditError(err.message);
        toastError("Failed to update customer");
      }
    },
    [apiService, success, toastError],
  );

  // ============================================================
  // PAYMENT OPERATIONS
  // ============================================================

  const fetchPayments = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      customerId?: string;
      saleId?: string;
      paymentStatus?: string;
    }) => {
      if (!apiService) return;

      setIsLoadingCredit(true);

      try {
        const response = await apiService.getPayments(
          {
            page: params?.page ?? 1,
            limit: params?.limit ?? 100,
            customerId: params?.customerId,
            saleId: params?.saleId,
            paymentStatus: params?.paymentStatus,
          },
          user?.token ? user.token : "",
        );

        const rawPaymentData =
          response.data?.data?.payments ||
          response.data?.payments ||
          (Array.isArray(response.data?.data) ? response.data.data : []);

        const normalizeId = (value: unknown) => {
          if (value === null || value === undefined) return "";
          if (typeof value === "string" || typeof value === "number")
            return String(value);
          if (typeof value === "object") {
            const maybe = value as Record<string, unknown>;
            return String(
              maybe._id ||
                maybe.id ||
                maybe.offline_id ||
                maybe.customerId ||
                "",
            );
          }
          return "";
        };

        const paymentData = (rawPaymentData || []).map((payment: any) => ({
          ...payment,
          customerId:
            normalizeId(payment.customerId) ||
            normalizeId(payment.customer) ||
            normalizeId(payment.customerId?.customerId) ||
            "",
        }));

        setPayments(paymentData);

        const state = storage.getState() as any;
        storage.saveState({
          ...state,
          payments: paymentData,
        });
      } catch (error: any) {
        // Fallback to cached
        const cached = ((storage.getState() as any).payments ||
          []) as Payment[];
        setPayments(cached);
      } finally {
        setIsLoadingCredit(false);
      }
    },
    [apiService],
  );

  const recordPayment = useCallback(
    async (payment: Partial<Payment>) => {
      if (!apiService) return;

      const newPayment: Payment = {
        customerId: payment.customerId || "",
        saleId: payment.saleId || "",
        amount: payment.amount || 0,
        paymentDate: payment.paymentDate || new Date().toISOString(),
        dueDate: payment.dueDate || new Date().toISOString(),
        paymentMethod: payment.paymentMethod || "cash",
        paymentStatus: "paid",
        daysOverdue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...payment,
      };

      setPayments((prev) => {
        const updated = [...prev, newPayment];
        const state = storage.getState() as any;
        storage.saveState({ ...state, payments: updated });
        return updated;
      });
      try {
        const response = await apiService.recordPayment(
          newPayment,
          user?.token ? user.token : "",
        );
        const serverPayment = response.data?.data;

        setPayments((prev) =>
          prev.map((p) =>
            p._id === serverPayment._id || p.id === serverPayment.id
              ? serverPayment
              : p,
          ),
        );

        success(`Payment of ${newPayment.amount} recorded successfully`);
      } catch (err: any) {
        setCreditError(err.message);
        toastError("Failed to record payment");
      }
    },
    [apiService, success, toastError],
  );

  // ============================================================
  // CREDIT CONFIG OPERATIONS
  // ============================================================

  const fetchCreditConfig = useCallback(async () => {
    if (!apiService) return;

    try {
      const response = await apiService.getCreditConfig();
      const config = response.data?.data;

      setCreditConfig(config);
      const state = storage.getState() as any;
      storage.saveState({
        ...state,
        creditConfig: config,
      });
    } catch (error: any) {
      // Use default
      const defaultConfig: CreditConfig = {
        interestRate: 0,
        lateFeeType: "fixed",
        lateFeeAmount: 0,
        daysDueBeforeOverdue: 30,
        autoApprovalLimit: 10000,
        requireApprovalAboveLimit: true,
        defaultPaymentTerm: "net_30",
        creditFeatureEnabled: true,
      };

      setCreditConfig(defaultConfig);
    }
  }, [apiService]);

  const updateCreditConfig = useCallback(
    async (config: Partial<CreditConfig>) => {
      if (!apiService) return;

      try {
        const response = await apiService.updateCreditConfig(
          config,
          user?.token ? user.token : "",
        );
        const updated = response.data?.data;

        setCreditConfig(updated);

        success("Credit config updated successfully");
      } catch (err: any) {
        setCreditError(err.message);
        toastError("Failed to update credit config");
      }
    },
    [apiService, success, toastError],
  );

  // ============================================================
  // REPORTING OPERATIONS
  // ============================================================

  const getAgingReport = useCallback(async (): Promise<AgingReport | null> => {
    if (!apiService) return null;

    try {
      const response = await apiService.getAgingReport();
      return response.data?.data || null;
    } catch (error) {
      return null;
    }
  }, [apiService]);

  const getCreditMetrics =
    useCallback(async (): Promise<CreditMetrics | null> => {
      if (!apiService) return null;

      try {
        const response = await apiService.getCreditMetrics();
        return response.data?.data || null;
      } catch (error) {
        return null;
      }
    }, [apiService]);

  return {
    // State
    customers,
    payments,
    creditConfig,
    isLoadingCredit,
    creditError,

    // Customer operations
    fetchCustomers,
    addCustomer,
    updateCustomer,

    // Payment operations
    fetchPayments,
    recordPayment,

    // Config operations
    fetchCreditConfig,
    updateCreditConfig,

    // Reporting
    getAgingReport,
    getCreditMetrics,
    // single customer fetch
    getCustomerById,
  };
}
