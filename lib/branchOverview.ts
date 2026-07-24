export interface BranchOverviewMetric {
  label: string;
  value: string;
  description: string;
}

export interface BranchOverviewActivityItem {
  title: string;
  detail: string;
  timestamp: string;
}

export interface BranchOverviewData {
  metrics: {
    salesCount: number;
    totalSalesValue: number;
    stockMovementCount: number;
    userCount: number;
    creditSalesCount: number;
    creditSalesValue: number;
    unpaidCreditSalesCount: number;
  };
  recentActivity: BranchOverviewActivityItem[];
}

export function buildBranchOverviewData(
  branch: any,
  users: any[] = [],
): BranchOverviewData {
  const sales = Array.isArray(branch?.sales) ? branch.sales : [];
  const stockMovements = Array.isArray(branch?.stockMovements)
    ? branch.stockMovements
    : [];

  const totalSalesValue = sales.reduce((sum: number, sale: any) => {
    const amount = Number(sale?.totalAmount ?? 0);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const isCreditSale = (sale: any) =>
    sale?.isCreditSale === true || sale?.creditSale === true;

  const isUnpaidCreditSale = (sale: any) => {
    if (!isCreditSale(sale)) return false;

    const paymentStatus = String(sale?.paymentStatus || "").toLowerCase();
    return [
      "pending",
      "partial",
      "overdue",
      "defaulted",
      "pending_approval",
    ].includes(paymentStatus);
  };

  const creditSales = sales.filter(isCreditSale);
  const creditSalesValue = creditSales.reduce((sum: number, sale: any) => {
    const amount = Number(sale?.totalAmount ?? 0);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  const unpaidCreditSalesCount = creditSales.filter(isUnpaidCreditSale).length;

  const recentActivity = [
    ...sales.slice(0, 2).map((sale: any) => ({
      title: "Recent sale",
      detail: sale?.reference || sale?.saleNumber || "Sales entry recorded",
      timestamp: sale?.createdAt || sale?.date || "",
    })),
    ...stockMovements.slice(0, 1).map((movement: any) => ({
      title: "Stock activity",
      detail:
        movement?.productName ||
        movement?.product?.name ||
        "Stock movement recorded",
      timestamp: movement?.createdAt || "",
    })),
  ]
    .sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""))
    .slice(0, 3);

  return {
    metrics: {
      salesCount: sales.length,
      totalSalesValue,
      stockMovementCount: stockMovements.length,
      userCount: users.length,
      creditSalesCount: creditSales.length,
      creditSalesValue,
      unpaidCreditSalesCount,
    },
    recentActivity,
  };
}
