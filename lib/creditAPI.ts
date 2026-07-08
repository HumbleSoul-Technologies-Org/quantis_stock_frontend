import axios, { AxiosError, AxiosInstance } from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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

  async createCustomer(data: CreateCustomerPayload) {
    return this.api.post("/customers", data);
  }

  async getCustomers(params?: {
    page?: number;
    limit?: number;
    creditStatus?: string;
    search?: string;
  }) {
    return this.api.get("/customers", { params });
  }

  async getCustomerById(id: string) {
    return this.api.get(`/customers/${id}`);
  }

  async updateCustomer(id: string, data: Partial<CreateCustomerPayload>) {
    return this.api.put(`/customers/${id}`, data);
  }

  // ============================================================
  // PAYMENT OPERATIONS
  // ============================================================

  async recordPayment(data: RecordPaymentPayload) {
    return this.api.post("/payments", data);
  }

  async getPayments(params?: {
    page?: number;
    limit?: number;
    customerId?: string;
    saleId?: string;
    paymentStatus?: string;
  }) {
    return this.api.get("/payments", { params });
  }

  // ============================================================
  // CREDIT APPROVAL OPERATIONS
  // ============================================================

  async createCreditApproval(data: {
    customerId: string;
    saleId: string;
    requestedAmount: number;
    requestedLimit?: number;
    reason?: string;
  }) {
    return this.api.post("/approvals", data);
  }

  async getPendingApprovals(params?: { page?: number; limit?: number }) {
    return this.api.get("/approvals/pending", { params });
  }

  async approveCreditApproval(id: string) {
    return this.api.put(`/approvals/${id}/approve`);
  }

  async rejectCreditApproval(
    id: string,
    data: {
      rejectionReason: string;
    },
  ) {
    return this.api.put(`/approvals/${id}/reject`, data);
  }

  // ============================================================
  // CREDIT CONFIG OPERATIONS
  // ============================================================

  async getCreditConfig() {
    return this.api.get("/config");
  }

  async updateCreditConfig(data: UpdateCreditConfigPayload) {
    return this.api.put("/config", data);
  }

  // ============================================================
  // REPORTING OPERATIONS
  // ============================================================

  async getAgingReport(params?: { startDate?: string; endDate?: string }) {
    return this.api.get("/reports/aging", { params });
  }

  async getCreditMetrics() {
    return this.api.get("/reports/metrics");
  }
}

export default CreditAPIService;
