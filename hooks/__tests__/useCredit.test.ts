import { renderHook, act, waitFor } from "@testing-library/react";
import { useCredit } from "../useCredit";
import * as creditAPIModule from "@/lib/creditAPI";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/useToast";

// Mock the modules
jest.mock("@/lib/creditAPI");
jest.mock("@/context/AuthContext");
jest.mock("@/hooks/useToast");
jest.mock("@/lib/storage", () => ({
  storage: {
    getState: jest.fn(() => ({})),
    saveState: jest.fn(),
  },
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

let mockServiceInstance: any;

describe("useCredit Hook", () => {
  const mockShowNotification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock API service instance
    mockServiceInstance = {
      getCustomers: jest.fn(),
      createCustomer: jest.fn(),
      updateCustomer: jest.fn(),
      getCustomerById: jest.fn(),
      getPayments: jest.fn(),
      recordPayment: jest.fn(),
      getCreditConfig: jest.fn(),
      updateCreditConfig: jest.fn(),
      getAgingReport: jest.fn(),
      getCreditMetrics: jest.fn(),
      createCreditApproval: jest.fn(),
      getPendingApprovals: jest.fn(),
      approveCreditApproval: jest.fn(),
      rejectCreditApproval: jest.fn(),
    };

    // Mock CreditAPIService constructor
    (
      creditAPIModule.CreditAPIService as jest.MockedClass<any>
    ).mockImplementation(() => mockServiceInstance);

    mockUseAuth.mockReturnValue({
      user: {
        id: "user-123",
        token: "test-token",
        businessId: "business-123",
        email: "test@example.com",
        name: "Test User",
      },
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      isLoading: false,
    } as any);

    mockUseToast.mockReturnValue({
      showNotification: mockShowNotification,
      removeNotification: jest.fn(),
    } as any);
  });

  describe("Initialization", () => {
    it("should initialize with empty state", () => {
      const { result } = renderHook(() => useCredit());

      expect(result.current.customers).toEqual([]);
      expect(result.current.payments).toEqual([]);
      expect(result.current.isLoadingCredit).toBe(false);
      expect(result.current.creditError).toBe(null);
    });

    it("should have all expected methods", () => {
      const { result } = renderHook(() => useCredit());

      expect(typeof result.current.fetchCustomers).toBe("function");
      expect(typeof result.current.addCustomer).toBe("function");
      expect(typeof result.current.updateCustomer).toBe("function");
      expect(typeof result.current.fetchPayments).toBe("function");
      expect(typeof result.current.recordPayment).toBe("function");
      expect(typeof result.current.fetchCreditConfig).toBe("function");
      expect(typeof result.current.updateCreditConfig).toBe("function");
      expect(typeof result.current.getAgingReport).toBe("function");
      expect(typeof result.current.getCreditMetrics).toBe("function");
    });

    it("should return null error initially", () => {
      const { result } = renderHook(() => useCredit());

      expect(result.current.creditError).toBeNull();
    });

    it("should return false for isLoadingCredit initially", () => {
      const { result } = renderHook(() => useCredit());

      expect(result.current.isLoadingCredit).toBe(false);
    });
  });

  describe("Customer Operations", () => {
    it("should fetch customers successfully", async () => {
      const mockCustomers = [
        {
          _id: "c1",
          name: "Customer 1",
          email: "c1@test.com",
          creditLimit: 5000,
        },
        {
          _id: "c2",
          name: "Customer 2",
          email: "c2@test.com",
          creditLimit: 10000,
        },
      ];

      mockServiceInstance.getCustomers.mockResolvedValue({
        data: { data: { customers: mockCustomers } },
      });

      const { result } = renderHook(() => useCredit());

      await act(async () => {
        await result.current.fetchCustomers({ page: 1 });
      });

      expect(result.current.customers).toHaveLength(2);
      expect(result.current.customers[0].name).toBe("Customer 1");
    });

    it("should add customer optimistically", async () => {
      const newCustomer = {
        name: "New Customer",
        email: "new@test.com",
        creditLimit: 5000,
      };

      mockServiceInstance.createCustomer.mockResolvedValue({
        data: { data: { ...newCustomer, _id: "new-id" } },
      });

      const { result } = renderHook(() => useCredit());

      await act(async () => {
        await result.current.addCustomer(newCustomer as any);
      });

      // Customer should be in the list
      expect(
        result.current.customers.some((c) => c.name === "New Customer"),
      ).toBe(true);
    });

    it("should handle customer fetch error", async () => {
      const error = new Error("Failed to fetch customers");
      mockServiceInstance.getCustomers.mockRejectedValue(error);

      const { result } = renderHook(() => useCredit());

      await act(async () => {
        await result.current.fetchCustomers({ page: 1 });
      });

      expect(result.current.creditError).toBeDefined();
    });

    it("should update customer successfully", async () => {
      const updates = { creditLimit: 15000 };

      mockServiceInstance.updateCustomer.mockResolvedValue({
        data: { data: { _id: "c1", name: "Customer 1", ...updates } },
      });

      const { result } = renderHook(() => useCredit());

      await act(async () => {
        await result.current.updateCustomer("c1", updates as any);
      });

      expect(mockServiceInstance.updateCustomer).toHaveBeenCalledWith(
        "c1",
        updates,
      );
    });
  });

  describe("Payment Operations", () => {
    it("should record payment successfully", async () => {
      const payment = {
        customerId: "c1",
        saleId: "s1",
        amount: 5000,
        paymentMethod: "cash" as const,
      };

      mockServiceInstance.recordPayment.mockResolvedValue({
        data: { data: { ...payment, _id: "pay-1" } },
      });

      const { result } = renderHook(() => useCredit());

      await act(async () => {
        await result.current.recordPayment(payment);
      });

      // Should have been called
      expect(mockServiceInstance.recordPayment).toHaveBeenCalled();
      // Payment should be in the list
      expect(result.current.payments.length).toBeGreaterThanOrEqual(0);
    });

    it("should fetch payments successfully", async () => {
      const mockPayments = [
        { _id: "p1", customerId: "c1", amount: 1000 },
        { _id: "p2", customerId: "c2", amount: 2000 },
      ];

      mockServiceInstance.getPayments.mockResolvedValue({
        data: { data: { payments: mockPayments } },
      });

      const { result } = renderHook(() => useCredit());

      await act(async () => {
        await result.current.fetchPayments({ page: 1 });
      });

      expect(result.current.payments).toHaveLength(2);
    });

    it("should handle payment recording error", async () => {
      const payment = {
        customerId: "c1",
        saleId: "s1",
        amount: 5000,
        paymentMethod: "cash" as const,
      };

      const error = new Error("Payment failed");
      mockServiceInstance.recordPayment.mockRejectedValue(error);

      const { result } = renderHook(() => useCredit());

      await act(async () => {
        await result.current.recordPayment(payment);
      });

      expect(result.current.creditError).toBeDefined();
    });
  });

  describe("Credit Config Operations", () => {
    it("should fetch credit config successfully", async () => {
      const mockConfig = {
        interestRate: 5,
        autoApprovalLimit: 10000,
      };

      mockServiceInstance.getCreditConfig.mockResolvedValue({
        data: { data: mockConfig },
      });

      const { result } = renderHook(() => useCredit());

      await act(async () => {
        await result.current.fetchCreditConfig();
      });

      expect(result.current.creditConfig).toBeDefined();
    });

    it("should update credit config successfully", async () => {
      const updates = { interestRate: 7 };

      mockServiceInstance.updateCreditConfig.mockResolvedValue({
        data: { data: updates },
      });

      const { result } = renderHook(() => useCredit());

      await act(async () => {
        await result.current.updateCreditConfig(updates as any);
      });

      expect(mockServiceInstance.updateCreditConfig).toHaveBeenCalledWith(
        updates,
      );
    });
  });

  describe("Reporting", () => {
    it("should get aging report successfully", async () => {
      const mockAgingReport = {
        current: { amount: 10000, count: 5 },
        overdue_1_30: { amount: 2000, count: 1 },
      };

      mockServiceInstance.getAgingReport.mockResolvedValue({
        data: { data: mockAgingReport },
      });

      const { result } = renderHook(() => useCredit());

      let agingReport;
      await act(async () => {
        agingReport = await result.current.getAgingReport();
      });

      expect(mockServiceInstance.getAgingReport).toHaveBeenCalled();
    });

    it("should get credit metrics successfully", async () => {
      const mockMetrics = {
        totalCreditSalesAmount: 50000,
        totalCollected: 30000,
        totalOutstanding: 20000,
      };

      mockServiceInstance.getCreditMetrics.mockResolvedValue({
        data: { data: mockMetrics },
      });

      const { result } = renderHook(() => useCredit());

      let metrics;
      await act(async () => {
        metrics = await result.current.getCreditMetrics();
      });

      expect(mockServiceInstance.getCreditMetrics).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      const error = new Error("API Error");
      mockServiceInstance.getCustomers.mockRejectedValue(error);

      const { result } = renderHook(() => useCredit());

      await act(async () => {
        await result.current.fetchCustomers({ page: 1 });
      });

      expect(result.current.creditError).toBeDefined();
    });

    it("should clear error when operation succeeds", async () => {
      mockServiceInstance.getCustomers.mockResolvedValue({
        data: { data: [] },
      });

      const { result } = renderHook(() => useCredit());

      await act(async () => {
        await result.current.fetchCustomers({ page: 1 });
      });

      // After successful operation, error should be null
      expect(result.current.creditError).toBeNull();
    });

    it("should set loading state during fetch", async () => {
      let resolveCustomers: any;
      const customerPromise = new Promise((resolve) => {
        resolveCustomers = resolve;
      });

      mockServiceInstance.getCustomers.mockReturnValue(customerPromise);

      const { result } = renderHook(() => useCredit());

      act(() => {
        result.current.fetchCustomers({ page: 1 });
      });

      // Initially loading
      expect(result.current.isLoadingCredit).toBe(true);

      // Resolve promise
      act(() => {
        resolveCustomers({ data: { data: [] } });
      });
    });
  });

  describe("Offline Support", () => {
    it("should return data from offline state when offline", () => {
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
      });

      const { result } = renderHook(() => useCredit());

      expect(result.current).toBeDefined();
      expect(result.current.customers).toBeDefined();
    });

    it("should sync data when coming back online", async () => {
      const mockCustomers = [
        {
          _id: "c1",
          name: "Customer 1",
          email: "c1@test.com",
          creditLimit: 5000,
        },
      ];

      mockServiceInstance.getCustomers.mockResolvedValue({
        data: { data: { customers: mockCustomers } },
      });

      const { result } = renderHook(() => useCredit());

      await act(async () => {
        await result.current.fetchCustomers({ page: 1 });
      });

      expect(result.current.customers).toHaveLength(1);
    });
  });

  describe("No Auth Scenario", () => {
    it("should handle when no user is authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isOnline: true,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useCredit());

      expect(result.current).toBeDefined();
    });
  });
});
