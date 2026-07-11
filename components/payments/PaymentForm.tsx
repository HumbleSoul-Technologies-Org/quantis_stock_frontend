"use client";

import { useState, useEffect } from "react";
import { useCredit, Payment, Customer } from "@/hooks/useCredit";
import { useToast } from "@/hooks/useToast";
import { useDataContext } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getNextCreditSaleTxnId } from "@/lib/transactionIdStorage";

interface PaymentFormProps {
  onSuccess?: () => void;
  isLoading?: boolean;
  initialCustomerId?: string;
  initialSaleId?: string;
  initialCustomer?: Customer | null;
}

export default function PaymentForm({
  onSuccess,
  isLoading = false,
  initialCustomerId = "",
  initialSaleId = "",
  initialCustomer = null,
}: PaymentFormProps) {
  const { customers, recordPayment } = useCredit();
  const { sales, products } = useDataContext();
  const { error: toastError } = useToast();

  const [formData, setFormData] = useState({
    customerId: "",
    saleId: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "cash" as const,
    reference: "",
    notes: "",
  });

  // Apply initial values if provided
  useEffect(() => {
    if (initialCustomerId || initialSaleId) {
      setFormData((prev) => ({
        ...prev,
        customerId: initialCustomerId || prev.customerId,
        saleId: initialSaleId || prev.saleId,
      }));
    }
  }, [initialCustomerId, initialSaleId]);

  const [submitting, setSubmitting] = useState(false);

  const selectedCustomer =
    initialCustomer ||
    customers.find(
      (c) => c.id === formData.customerId || c._id === formData.customerId,
    );

  const resolvedCustomerId =
    formData.customerId ||
    initialCustomer?.id ||
    initialCustomer?._id ||
    selectedCustomer?.id ||
    selectedCustomer?._id ||
    "";

  const saleIdFrom = (sale: { _id?: string; id?: string }) =>
    String(sale._id || sale.id || "");

  const matchesCustomerId = (saleCustomerId: unknown) => {
    const id = String(saleCustomerId || "");
    return (
      id === resolvedCustomerId ||
      id === String(initialCustomer?.id || "") ||
      id === String(initialCustomer?._id || "") ||
      id === String(selectedCustomer?.id || "") ||
      id === String(selectedCustomer?._id || "")
    );
  };

  const availableSales = sales.filter(
    (s) =>
      s.isCreditSale &&
      matchesCustomerId(s.customerId) &&
      s.paymentStatus !== "paid",
  );

  const selectedSale = availableSales.find(
    (s) => String(s._id || s.id) === String(formData.saleId),
  );

  const outstandingAmount = selectedSale
    ? selectedSale.totalAmount - (selectedSale.paidAmount || 0)
    : 0;

  const paymentAmount = parseFloat(formData.amount || "0") || 0;
  const remainingBalance = selectedSale ? outstandingAmount - paymentAmount : 0;

  useEffect(() => {
    if (!formData.reference) {
      setFormData((prev) => ({
        ...prev,
        reference: getNextCreditSaleTxnId(),
      }));
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.customerId) {
      toastError("Please select a customer");
      return;
    }

    if (!formData.saleId) {
      toastError("Please select a sale");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      toastError("Please enter a valid payment amount");
      return;
    }

    if (amount > outstandingAmount) {
      toastError(
        `Payment exceeds outstanding balance of KES ${outstandingAmount.toLocaleString()}`,
      );
      return;
    }

    setSubmitting(true);

    try {
      const payment: Partial<Payment> = {
        customerId: formData.customerId,
        saleId: formData.saleId,
        amount,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
      };

      await recordPayment(payment);

      setFormData({
        customerId: "",
        saleId: "",
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "cash",
        reference: "",
        notes: "",
      });

      onSuccess?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to record payment";
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl h-xl overflow-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Record Payment</h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 border-none overflow-y-auto "
        >
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Customer *</label>
            <Input
              disabled
              value={selectedCustomer?.name || "Customer selected"}
              className="w-full bg-slate-100 dark:bg-slate-900"
            />
            <input
              type="hidden"
              name="customerId"
              value={formData.customerId}
            />
          </div>

          {/* Outstanding Credit Sales */}
          {formData.customerId && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Outstanding Credit Sales
              </label>
              {availableSales.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                  No outstanding credit sales for this customer
                </div>
              ) : (
                <div className="space-y-4">
                  {availableSales.map((sale) => {
                    const saleId = saleIdFrom(sale);
                    const outstanding =
                      sale.totalAmount - (sale.paidAmount || 0);
                    const isSelected = saleId === formData.saleId;

                    return (
                      <div
                        key={saleId}
                        className={
                          "rounded-lg border p-4 " +
                          (isSelected
                            ? "border-primary bg-slate-50 dark:border-slate-400 dark:bg-slate-800"
                            : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900")
                        }
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {sale.saleNumber} • Outstanding KES{" "}
                              {outstanding.toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Total: KES {sale.totalAmount.toLocaleString()} •
                              Paid: KES{" "}
                              {(sale.paidAmount || 0).toLocaleString()}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                saleId,
                              }))
                            }
                            className={
                              "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium " +
                              (isSelected
                                ? "bg-primary text-white"
                                : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800")
                            }
                          >
                            {isSelected ? "Selected" : "Select this sale"}
                          </button>
                        </div>

                        {sale.items && sale.items.length > 0 && (
                          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <table className="w-full text-sm">
                              <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                  <th className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-300">
                                    Item
                                  </th>
                                  <th className="px-3 py-2 text-right font-medium text-slate-600 dark:text-slate-300">
                                    Qty
                                  </th>
                                  <th className="px-3 py-2 text-right font-medium text-slate-600 dark:text-slate-300">
                                    Unit
                                  </th>
                                  <th className="px-3 py-2 text-right font-medium text-slate-600 dark:text-slate-300">
                                    Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {sale.items.map((item, index) => {
                                  const product = products.find(
                                    (product) =>
                                      product.id === item.productId ||
                                      product._id === item.productId,
                                  );

                                  return (
                                    <tr
                                      key={index}
                                      className="border-t border-slate-200 dark:border-slate-700"
                                    >
                                      <td className="px-3 py-2 text-slate-900 dark:text-slate-100">
                                        {product?.name || item.productId}
                                      </td>
                                      <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                                        {item.quantity}
                                      </td>
                                      <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                                        {item.unitPrice.toLocaleString()}
                                      </td>
                                      <td className="px-3 py-2 text-right text-slate-900 dark:text-slate-100">
                                        {item.total.toLocaleString()}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Outstanding Balance Display */}
          {selectedSale && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Sale Amount:</span>
                  <p className="text-lg font-bold">
                    KES {selectedSale.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Already Paid:</span>
                  <p className="text-lg font-bold">
                    KES {(selectedSale.paidAmount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Outstanding Balance:</span>
                  <p className="text-lg font-bold text-red-600">
                    KES {outstandingAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Amount *
            </label>
            <Input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              max={outstandingAmount || undefined}
              required
              disabled={!formData.saleId}
              className="w-full"
            />
            {selectedSale && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Outstanding Balance: USh {outstandingAmount.toLocaleString()}
                </p>
                <p
                  className={`text-xs ${
                    paymentAmount > 0 && remainingBalance <= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : remainingBalance < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-500 dark:text-slate-400"
                  }`}
                >
                  Remaining after payment: USh{" "}
                  {remainingBalance.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Date *
            </label>
            <Input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Method *
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Reference (e.g., Cheque Number, TxnID)
            </label>
            <Input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="CHQ-12345 or TXN-ABC123"
              className="w-full"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes about this payment..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={submitting || isLoading || !formData.saleId}
              className="flex-1"
            >
              {submitting ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
