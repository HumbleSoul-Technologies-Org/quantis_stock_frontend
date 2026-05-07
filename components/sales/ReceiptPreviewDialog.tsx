"use client";

import { useRef } from "react";
import { Sale, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { buildReceiptData } from "@/lib/receiptDataBuilder";

interface ReceiptPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  products: Product[];
  onPrint: (receiptData: any) => Promise<void>;
}

export function ReceiptPreviewDialog({
  isOpen,
  onOpenChange,
  sale,
  products,
  onPrint,
}: ReceiptPreviewDialogProps) {
  const { user, business } = useAuth();
  const { formatCurrency } = useSettings();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!sale) return null;

  // Format number with k/M/B suffix and no decimals
  const formatShortNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(0) + "B";
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + "k";
    }
    return Math.round(num).toString();
  };

  // Calculate totals
  const items = sale.items || [];
  const subtotal = items.reduce(
    (sum: number, item: any) => sum + item.total,
    0,
  );
  const taxRate = 0.1; // 10% tax (adjust as needed)
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax;

  // Handle cashier field - it might be an object or string
  const getCashierName = () => {
    if (typeof sale.createdBy === "string") {
      return sale.createdBy;
    } else if (
      sale.createdBy &&
      typeof sale.createdBy === "object" &&
      sale.createdBy &&
      "username" in sale.createdBy
    ) {
      return (sale.createdBy as any).username;
    }
    return user?.username || "---";
  };

  const handlePrintReceipt = async () => {
    const receiptData = buildReceiptData(sale, products, business, user);
    await onPrint(receiptData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            ref={receiptRef}
            className="receipt-container bg-white dark:bg-white text-black p-4 rounded-xl font-mono max-w-[380px] mx-auto border border-gray-300 dark:border-gray-300 shadow-sm"
            style={{ fontFamily: "monospace" }}
          >
            {/* Header */}
            <div className="receipt-header text-center border-b-2 border-dashed border-black pb-3 mb-3">
              <div className="receipt-title font-bold text-lg">
                {business?.businessName || "BUSINESS NAME"}
              </div>
              <div className="receipt-subtitle text-xs text-gray-700">
                {business?.businessAddress || "Address Line 1"}
              </div>
              <div className="receipt-subtitle text-xs text-gray-700">
                {business?.businessPhone?.contact
                  ? business.businessPhone.contact
                  : "Phone: XXXX-XXXX-XXXX"}
              </div>
              <div className="receipt-title text-base font-bold mt-2">
                SALES RECEIPT
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-1 text-xs mb-3">
              <p className="receipt-info">
                Date:{" "}
                <b>{new Date(sale.date || new Date()).toLocaleDateString()}</b>
              </p>
              <p className="receipt-info">
                Receipt #: <b>{sale.saleNumber || "---"}</b>
              </p>
              <p className="receipt-info">
                Cashier: <b>{getCashierName()}</b>
              </p>
              <p className="receipt-info">
                Customer: <b>{sale.customerName || "Walk-in"}</b>
              </p>
            </div>

            {/* Items Table */}
            <table className="items-table w-full mb-3">
              <thead>
                <tr className="border-b-2 border-dashed border-black">
                  <th className="text-left text-xs font-bold pb-2">Item</th>
                  <th className="qty text-right text-xs font-bold pb-2 w-10">
                    Qty
                  </th>
                  <th className="price text-right text-xs font-bold pb-2 w-16">
                    Price
                  </th>
                  <th className="total text-right text-xs font-bold pb-2 w-16">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item: any, index: number) => {
                    const product = products.find(
                      (p: any) =>
                        p.id === item.productId || p._id === item.productId,
                    );
                    return (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="text-xs py-1">
                          {product?.name || "Product"}
                        </td>
                        <td className="qty text-right text-xs py-1">
                          {item.quantity}
                        </td>
                        <td className="price text-right text-xs py-1">
                          {formatShortNumber(item.unitPrice)}
                        </td>
                        <td className="total text-right text-xs py-1 font-semibold">
                          {formatShortNumber(item.total)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center text-xs py-2 text-gray-500"
                    >
                      No items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals Section */}
            <div className="totals-section border-t-2 border-b-2 border-dashed border-black py-2 my-3">
              <div className="total-row grand-total border-t border-black pt-2 mt-2">
                <span>TOTAL:</span>
                <span>{formatShortNumber(grandTotal)}</span>
              </div>
            </div>

            {/* Payment Information */}
            <div className="payment-info bg-gray-50 border border-gray-200 p-2 rounded mb-3 text-xs">
              <div className="payment-info-row font-semibold">
                <span>Payment Method:</span>
                <span className="uppercase">
                  {sale.paymentType
                    ? sale.paymentType.charAt(0).toUpperCase() +
                      sale.paymentType.slice(1)
                    : "Cash"}
                </span>
              </div>
              {sale.paymentType !== "cash" && sale.txnId && (
                <div className="payment-info-row">
                  <span>Transaction ID:</span>
                  <span className="font-mono">{sale.txnId}</span>
                </div>
              )}
              {sale.notes && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <span className="text-xs text-gray-600">
                    Notes: {sale.notes}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="receipt-number text-xs text-gray-600 mb-3">
              {sale.txnId
                ? `Transaction ID: ${sale.txnId}`
                : "please keep this receipt for your records."}
            </div>
            <div className="footer-message text-center text-lg font-bold mb-2">
              THANK YOU!
            </div>
            <div className="footer-text text-center text-xs text-gray-600">
              Please visit us again 😊
            </div>
          </div>

          {/* Print Button */}
          <style>{`
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              body * {
                visibility: hidden;
              }
              .receipt-container,
              .receipt-container * {
                visibility: visible;
              }
              .receipt-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 80mm;
                max-width: 100%;
                margin: 0;
                padding: 10px;
                background: white;
                box-shadow: none;
                border: none;
                border-radius: 0;
                page-break-after: always;
              }
              .receipt-container table {
                width: 100%;
                border-collapse: collapse;
              }
              .receipt-container th,
              .receipt-container td {
                border: none;
                padding: 2px 0;
              }
              .receipt-container th {
                font-weight: 700;
              }
              .receipt-container .receipt-header,
              .receipt-container .totals-section,
              .receipt-container .payment-info {
                border-color: #000;
              }
            }
          `}</style>
          <div className="flex gap-2 justify-center no-print">
            <Button
              onClick={handlePrintReceipt}
              className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
