"use client";

import { useState, useEffect } from "react";
import { useCredit, Payment } from "@/hooks/useCredit";
import { useToast } from "@/hooks/useToast";
import { useDataContext } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface PaymentFormProps {
  onSuccess?: () => void;
  isLoading?: boolean;
  initialCustomerId?: string;
  initialSaleId?: string;
}

export default function PaymentForm({
  onSuccess,
  isLoading = false,
  initialCustomerId = "",
  initialSaleId = "",
}: PaymentFormProps) {
  const { customers, recordPayment } = useCredit();
  const { sales } = useDataContext();
  const { success, error: toastError, info } = useToast();

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

  const selectedCustomer = customers.find(
    (c) => c.id === formData.customerId || c._id === formData.customerId,
  );

  const availableSales = sales.filter(
    (s) =>
      s.isCreditSale &&
      (s.customerId === formData.customerId || s._id === formData.customerId) &&
      s.paymentStatus !== "paid",
  );

  const selectedSale = availableSales.find(
    (s) => s.id === formData.saleId || s._id === formData.saleId,
  );

  const outstandingAmount = selectedSale
    ? selectedSale.totalAmount - (selectedSale.paidAmount || 0)
    : 0;

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
    } catch (err: any) {
      toastError(err.message || "Failed to record payment");
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
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Select a customer...</option>
              {customers.map((customer) => (
                <option
                  key={customer._id || customer.id}
                  value={customer._id || customer.id}
                >
                  {customer.name} - {customer.email}
                </option>
              ))}
            </select>
          </div>

          {/* Sale Selection */}
          {formData.customerId && (
            <div>
              <label className="block text-sm font-medium mb-2">Sale *</label>
              {availableSales.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                  No outstanding credit sales for this customer
                </div>
              ) : (
                <select
                  name="saleId"
                  value={formData.saleId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select a sale...</option>
                  {availableSales.map((sale) => {
                    const outstanding =
                      sale.totalAmount - (sale.paidAmount || 0);
                    return (
                      <option
                        key={sale._id || sale.id}
                        value={sale._id || sale.id}
                      >
                        {sale.saleNumber} - KES{" "}
                        {sale.totalAmount.toLocaleString()} (Outstanding: KES{" "}
                        {outstanding.toLocaleString()})
                      </option>
                    );
                  })}
                </select>
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
            {outstandingAmount && (
              <p className="text-xs text-gray-500 mt-1">
                Max: KES {outstandingAmount.toLocaleString()}
              </p>
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
