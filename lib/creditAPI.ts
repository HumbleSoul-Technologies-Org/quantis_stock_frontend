import axios, { AxiosError, AxiosInstance } from "axios";
import { apiRequest } from "./queryClient";
import { API_BASE_URL } from "./config";

export interface CreateCustomerPayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  creditLimit?: number;
  offline_id?: string;
}

export interface RecordPaymentPayload {
  customerId: string;
  saleId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: "cash" | "cheque" | "bank_transfer" | "card" | "other";
  reference?: string;
  notes?: string;
  offline_id?: string;
}

export interface UpdateCreditConfigPayload {
  interestRate?: number;
  lateFeeType?: "fixed" | "percentage";
  lateFeeAmount?: number;
  daysDueBeforeOverdue?: number;
  autoApprovalLimit?: number;
  defaultPaymentTerm?: string;
  requireApprovalAboveLimit?: boolean;
  creditFeatureEnabled?: boolean;
}

export class CreditAPIService {
  private api: AxiosInstance;

  constructor(token: string, businessId: string) {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/credit`,
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Business-Id": businessId,
      },
    });
  }

  // ============================================================
  // CUSTOMER OPERATIONS
  // ============================================================

  async createCustomer(data: CreateCustomerPayload, token?: string) {
    return await apiRequest("POST", "/credit/customers/new", data, token);
  }

  async getCustomers(
    params?: {
      page?: number;
      limit?: number;
      creditStatus?: string;
      search?: string;
    },
    token?: string,
  ) {
    return await apiRequest("GET", "/credit/customers", params, token);
  }

  async getCustomerById(id: string, token?: string) {
    return await apiRequest("GET", `/credit/customers/${id}`, {}, token);
  }

  async updateCustomer(
    id: string,
    data: Partial<CreateCustomerPayload>,
    token?: string,
  ) {
    return await apiRequest("PUT", `/credit/customers/${id}`, data, token);
  }

  // ============================================================
  // PAYMENT OPERATIONS
  // ============================================================

  async recordPayment(data: RecordPaymentPayload, token?: string) {
    return await apiRequest("POST", "/credit/payments", data, token);
  }

  async getPayments(
    params?: {
      page?: number;
      limit?: number;
      customerId?: string;
      saleId?: string;
      paymentStatus?: string;
    },
    token?: string,
  ) {
    return await apiRequest("GET", "/credit/payments", params, token);
  }

  // ============================================================
  // CREDIT APPROVAL OPERATIONS
  // ============================================================

  async createCreditApproval(
    data: {
      customerId: string;
      saleId: string;
      requestedAmount: number;
      requestedLimit?: number;
      reason?: string;
      // Optional token for approval
    },
    token?: string,
  ) {
    return await apiRequest("POST", "/credit/approvals", data, token);
  }

  async getPendingApprovals(
    params?: { page?: number; limit?: number },
    token?: string,
  ) {
    return await apiRequest("GET", "/credit/approvals/pending", params, token);
  }

  async approveCreditApproval(id: string, token?: string) {
    return await apiRequest(
      "PUT",
      `/credit/approvals/${id}/approve`,
      {},
      token,
    );
  }

  async rejectCreditApproval(
    id: string,
    data: {
      rejectionReason: string;
    },
    token?: string,
  ) {
    return await apiRequest(
      "PUT",
      `/credit/approvals/${id}/reject`,
      data,
      token,
    );
  }

  // ============================================================
  // CREDIT CONFIG OPERATIONS
  // ============================================================

  async getCreditConfig(token?: string) {
    return await apiRequest("GET", "/credit/config", {}, token);
  }

  async updateCreditConfig(data: UpdateCreditConfigPayload, token?: string) {
    return await apiRequest("PUT", "/credit/config", data, token);
  }

  // ============================================================
  // REPORTING OPERATIONS
  // ============================================================

  async getAgingReport(
    params?: { startDate?: string; endDate?: string },
    token?: string,
  ) {
    return await apiRequest("GET", "/credit/reports/aging", params, token);
  }

  async getCreditMetrics(token?: string) {
    return await apiRequest("GET", "/credit/reports/metrics", {}, token);
  }
}

export default CreditAPIService;
