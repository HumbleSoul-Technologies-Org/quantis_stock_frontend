"use client";

import { type RefObject } from "react";
import { Sale, Product } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";

interface ReceiptTemplateProps {
  payLoad?: Sale & { products?: Product[] };
  receiptRef?: RefObject<HTMLDivElement | null>;
}

export function ReceiptTemplate({ payLoad, receiptRef }: ReceiptTemplateProps) {
  const { user, business } = useAuth();
  const { formatCurrency } = useSettings();

  const items = payLoad?.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.1;
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax;

  const cashierName =
    typeof payLoad?.createdBy === "string"
      ? payLoad.createdBy
      : (payLoad?.createdBy as any)?.username || user?.username || "---";

  const paymentType = payLoad?.paymentType || "cash";

  return (
    <div
      ref={receiptRef}
      className="receipt-container bg-white dark:bg-white text-black p-4 rounded-xl font-mono max-w-95 mx-auto border border-gray-300 dark:border-gray-300 shadow-sm"
      style={{ fontFamily: "monospace" }}
    >
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

      <div className="space-y-1 text-xs mb-3 text-slate-900">
        <p className="receipt-info">
          Date:{" "}
          <b>{new Date(payLoad?.date || new Date()).toLocaleDateString()}</b>
        </p>
        <p className="receipt-info">
          Receipt #: <b>{payLoad?.reference || payLoad?.saleNumber || "---"}</b>
        </p>
        <p className="receipt-info">
          Cashier: <b>{cashierName}</b>
        </p>
        <p className="receipt-info">
          Customer: <b>{payLoad?.customerName || "Walk-in"}</b>
        </p>
      </div>

      <table className="items-table w-full mb-3 text-[11px]">
        <thead>
          <tr className="border-b-2 border-dashed border-black">
            <th className="text-left text-xs font-bold pb-2">Item</th>
            <th className="qty text-right text-xs font-bold pb-2 w-10">Qty</th>
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
            items.map((item, index) => {
              const product = payLoad?.products?.find(
                (p) => p.id === item.productId || p._id === item.productId,
              );
              return (
                <tr key={index} className="border-b border-gray-200">
                  <td className="text-xs py-1">{product?.name || "Product"}</td>
                  <td className="qty text-right text-xs py-1">
                    {item.quantity}
                  </td>
                  <td className="price text-right text-xs py-1">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="total text-right text-xs py-1 font-semibold">
                    {formatCurrency(item.total)}
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

      <div className="totals-section border-t-2 border-b-2 border-dashed border-black py-2 my-3">
        <div className="total-row grand-total border-t border-black pt-2 mt-2 flex justify-between font-semibold text-xs">
          <span>TOTAL:</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      <div className="payment-info bg-gray-50 border border-gray-200 p-2 rounded mb-3 text-xs text-slate-700">
        <div className="payment-info-row flex justify-between font-semibold">
          <span>Payment Method:</span>
          <span className="uppercase">
            {paymentType.charAt(0).toUpperCase() + paymentType.slice(1)}
          </span>
        </div>
        {paymentType !== "cash" && payLoad?.txnId && (
          <div className="payment-info-row flex justify-between mt-1">
            <span>Transaction ID:</span>
            <span className="font-mono">{payLoad.txnId}</span>
          </div>
        )}
        {payLoad?.notes && (
          <div className="mt-2 pt-2 border-t border-gray-300 text-[10px] text-gray-600">
            Notes: {payLoad.notes}
          </div>
        )}
      </div>

      <div className="receipt-number text-xs text-gray-600 mb-3">
        {payLoad?.txnId
          ? `Transaction ID: ${payLoad.txnId}`
          : "please keep this receipt for your records."}
      </div>
      <div className="footer-message text-center text-lg font-bold mb-2">
        THANK YOU!
      </div>
      <div className="footer-text text-center text-xs text-gray-600">
        Please visit us again 😊
      </div>
    </div>
  );
}
