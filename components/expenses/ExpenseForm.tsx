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
import type { Expense, ExpenseCategory } from "@/lib/types";

interface ExpenseFormProps {
  isOpen: boolean;
  expense?: Expense;
  categories: ExpenseCategory[];
  onSubmit: (expense: Partial<Expense>) => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  serverError?: string;
}

const defaultExpenseState: Partial<Expense> = {
  title: "",
  description: "",
  amount: 0,
  currency: "USD",
  expenseDate: new Date().toISOString().slice(0, 10),
  paymentMethod: "cash",
  paymentStatus: "unpaid",
  approvalStatus: "draft",
  costCenter: "other",
};

export function ExpenseForm({
  isOpen,
  expense,
  categories,
  onSubmit,
  onOpenChange,
  serverError = "",
}: ExpenseFormProps) {
  const [formData, setFormData] = useState<Partial<Expense>>(
    expense ? { ...expense } : defaultExpenseState,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(expense ? { ...expense } : defaultExpenseState);
    setErrors({});
  }, [expense, isOpen]);

  const handleChange = (
    field: keyof Expense,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than zero";
    }
    if (!formData.expenseDate) {
      newErrors.expenseDate = "Date is required";
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
          <DialogTitle>{expense ? "Edit Expense" : "New Expense"}</DialogTitle>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Title
            </label>
            <Input
              value={formData.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
            />
            {errors.title ? (
              <span className="text-sm text-red-600">{errors.title}</span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Category
            </label>
            <select
              className="rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none focus:border-ring focus:ring-ring/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={formData.categoryId || ""}
              onChange={(e) => handleChange("categoryId", e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option
                  key={category.id || category._id}
                  value={category.id || category._id}
                >
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId ? (
              <span className="text-sm text-red-600">{errors.categoryId}</span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Amount
            </label>
            <Input
              type="number"
              value={formData.amount?.toString() || ""}
              onChange={(e) => handleChange("amount", Number(e.target.value))}
            />
            {errors.amount ? (
              <span className="text-sm text-red-600">{errors.amount}</span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Date
            </label>
            <Input
              type="date"
              value={formData.expenseDate?.slice(0, 10) || ""}
              onChange={(e) => handleChange("expenseDate", e.target.value)}
            />
            {errors.expenseDate ? (
              <span className="text-sm text-red-600">{errors.expenseDate}</span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Payment Method
            </label>
            <select
              className="rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none focus:border-ring focus:ring-ring/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={formData.paymentMethod || "cash"}
              onChange={(e) => handleChange("paymentMethod", e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="mobileMoney">Mobile Money</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Approval Status
            </label>
            <select
              className="rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none focus:border-ring focus:ring-ring/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={formData.approvalStatus || "draft"}
              onChange={(e) => handleChange("approvalStatus", e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit">
              {expense ? "Update Expense" : "Create Expense"}
            </Button>
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
