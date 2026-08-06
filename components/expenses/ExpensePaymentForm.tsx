"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Expense, ExpensePaymentPayload } from "@/lib/types";

interface ExpensePaymentFormProps {
  isOpen: boolean;
  expense: Expense;
  onSubmit: (payment: ExpensePaymentPayload) => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  serverError?: string;
}

const defaultPaymentState: Omit<ExpensePaymentPayload, "expenseId"> = {
  amount: 0,
  paymentDate: new Date().toISOString().slice(0, 10),
  paymentMethod: "cash",
  reference: "",
};

export function ExpensePaymentForm({
  isOpen,
  expense,
  onSubmit,
  onOpenChange,
  serverError = "",
}: ExpensePaymentFormProps) {
  const [formData, setFormData] = useState<ExpensePaymentPayload>({
    ...defaultPaymentState,
    expenseId: expense.id || expense._id || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      ...defaultPaymentState,
      expenseId: expense.id || expense._id || "",
    });
    setErrors({});
  }, [expense, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than zero";
    }
    if (!formData.paymentDate) {
      newErrors.paymentDate = "Payment date is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Payment for {expense.title}</DialogTitle>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Amount
            </label>
            <Input
              type="number"
              value={formData.amount || ""}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: Number(event.target.value),
                }))
              }
            />
            {errors.amount ? (
              <span className="text-sm text-red-600">{errors.amount}</span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Payment Date
            </label>
            <Input
              type="date"
              value={formData.paymentDate}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentDate: event.target.value,
                }))
              }
            />
            {errors.paymentDate ? (
              <span className="text-sm text-red-600">{errors.paymentDate}</span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Payment Method
            </label>
            <select
              className="rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none focus:border-ring focus:ring-ring/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={formData.paymentMethod}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentMethod: event.target
                    .value as ExpensePaymentPayload["paymentMethod"],
                }))
              }
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="mobileMoney">Mobile Money</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Reference (optional)
            </label>
            <Input
              value={formData.reference}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  reference: event.target.value,
                }))
              }
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Record Payment</Button>
          </div>

          {serverError ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {serverError}
            </div>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
