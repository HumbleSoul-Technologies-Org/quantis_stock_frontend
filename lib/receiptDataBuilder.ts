/**
 * Utility for building receipt data from sale objects
 * Centralizes receipt data building logic to reduce duplication
 */

import { Sale, Product } from "@/lib/types";

export interface ReceiptData {
  // Transaction info
  saleNumber: string;
  date: string;

  // Customer info
  customerName?: string;
  cashier: string;

  // Business info
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;

  // Items
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;

  // Payment info
  paymentType?: string;
  txnId?: string;
  notes?: string;
}

export function buildReceiptData(
  sale: Sale,
  products: Product[],
  business?: any,
  user?: any
): ReceiptData {
  const getProductName = (productId?: string) => {
    return (
      products.find((p) => p.id === productId || p._id === productId)?.name ||
      "Unknown Product"
    );
  };

  // Handle cashier field - it might be an object or string
  const getCashierName = () => {
    if (typeof sale.createdBy === 'string') {
      return sale.createdBy;
    } else if (sale.createdBy && typeof sale.createdBy === 'object' && sale.createdBy && 'username' in sale.createdBy) {
      return (sale.createdBy as any).username;
    }
    return user?.username || "---";
  };

  return {
    // Transaction info
    saleNumber: sale.saleNumber,
    date: sale.date,

    // Customer info
    customerName: sale.customerName,
    cashier: getCashierName(),

    // Business info
    businessName: business?.businessName,
    businessAddress: business?.businessAddress,
    businessPhone: business?.businessPhone?.contact,

    // Items
    items: sale.items.map((item) => ({
      name: getProductName(item.productId),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    })),
    totalAmount: sale.totalAmount,

    // Payment info
    paymentType: sale.paymentType,
    txnId: sale.txnId,
    notes: sale.notes,
  };
}