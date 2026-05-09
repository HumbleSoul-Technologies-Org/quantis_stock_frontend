"use client";

import { useEffect, useRef } from "react";
import { Sale, Product } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";

interface ReceiptPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  products: Product[];
  onPrint?: (receiptData: any) => Promise<void>;
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

  useEffect(() => {
    if (!isOpen || !sale) return;

    const printReceipt = () => {
      if (typeof window !== "undefined" && window.print) {
        window.print();
      }
    };

    const handleAfterPrint = () => {
      onOpenChange(false);
    };

    const timeout = window.setTimeout(printReceipt, 150);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [isOpen, sale, onOpenChange]);

  if (!isOpen || !sale) return null;

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

  return (
    <div className="receipt-print-area">
      <div
        ref={receiptRef}
        className="receipt-container bg-white text-slate-950 p-4 rounded-xl font-mono max-w-92 mx-auto border border-slate-300 shadow-sm"
        style={{ fontFamily: "monospace" }}
      >
        {/* Header */}
        <div className="receipt-header text-center border-b border-dashed border-slate-700 pb-3 mb-3">
          <div className="receipt-title font-bold text-lg tracking-[0.12em] uppercase">
            {business?.businessName || "BUSINESS NAME"}
          </div>
          <div className="receipt-subtitle text-[11px] text-slate-600">
            {business?.businessAddress || "Address Line 1"}
          </div>
          <div className="receipt-subtitle text-[11px] text-slate-600">
            {business?.businessPhone?.contact
              ? business.businessPhone.contact
              : "Phone: XXXX-XXXX-XXXX"}
          </div>
          <div className="receipt-title text-sm font-semibold mt-3">
            SALES RECEIPT
          </div>
        </div>

        {/* Transaction Details */}
        <div className="space-y-1 text-[11px] mb-3 text-slate-700">
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
        <table className="items-table w-full mb-3 text-[11px]">
          <thead>
            <tr className="border-b border-dashed border-slate-700">
              <th className="text-left font-semibold pb-2">Item</th>
              <th className="text-right font-semibold pb-2 w-10">Qty</th>
              <th className="text-right font-semibold pb-2 w-16">Price</th>
              <th className="text-right font-semibold pb-2 w-16">Total</th>
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
                  <tr key={index} className="border-b border-slate-200">
                    <td className="py-1 text-[11px]">
                      {product?.name || "Product"}
                    </td>
                    <td className="text-right py-1 text-[11px]">
                      {item.quantity}
                    </td>
                    <td className="text-right py-1 text-[11px]">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="text-right py-1 font-semibold text-[11px]">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-2 text-[11px] text-slate-500"
                >
                  No items
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="totals-section border-y border-dashed border-slate-700 py-2 my-3 text-[11px]">
          <div className="total-row grand-total border-t border-slate-700 pt-2 mt-2 flex justify-between font-semibold">
            <span>TOTAL</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* Payment Information */}
        <div className="payment-info bg-slate-50 border border-slate-200 p-2 rounded mb-3 text-[11px] text-slate-700">
          <div className="payment-info-row flex justify-between font-semibold">
            <span>Payment Method:</span>
            <span className="uppercase">
              {sale.paymentType
                ? sale.paymentType.charAt(0).toUpperCase() +
                  sale.paymentType.slice(1)
                : "Cash"}
            </span>
          </div>
          {sale.paymentType !== "cash" && sale.txnId && (
            <div className="payment-info-row flex justify-between mt-1">
              <span>Txn ID:</span>
              <span className="font-mono">{sale.txnId}</span>
            </div>
          )}
          {sale.notes && (
            <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-600">
              Notes: {sale.notes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="receipt-number text-[10px] text-slate-600 mb-3">
          {sale.txnId
            ? `Transaction ID: ${sale.txnId}`
            : "please keep this receipt for your records."}
        </div>
        <div className="footer-message text-center text-sm font-bold mb-2">
          THANK YOU!
        </div>
        <div className="footer-text text-center text-[10px] text-slate-600">
          Please visit us again 😊
        </div>
      </div>

      <style>{`
        @media screen {
          .receipt-print-area {
            display: none;
          }
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          body * {
            visibility: hidden;
          }
          .receipt-print-area,
          .receipt-print-area * {
            visibility: visible;
          }
          .receipt-print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            background: white;
          }
          .receipt-container {
            margin: 0 auto;
            width: 80mm;
            max-width: 100%;
            padding: 12px;
            border: none;
            border-radius: 0;
            box-shadow: none;
            background: white;
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
    </div>
  );
}
