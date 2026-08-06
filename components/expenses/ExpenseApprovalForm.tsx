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
import type { Expense, ExpenseApprovalPayload } from "@/lib/types";

interface ExpenseApprovalFormProps {
  isOpen: boolean;
  expense: Expense;
  onSubmit: (approval: ExpenseApprovalPayload) => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  serverError?: string;
}

const defaultApprovalState: Omit<ExpenseApprovalPayload, "expenseId"> = {
  status: "submitted",
  note: "",
};

export function ExpenseApprovalForm({
  isOpen,
  expense,
  onSubmit,
  onOpenChange,
  serverError = "",
}: ExpenseApprovalFormProps) {
  const [formData, setFormData] = useState<ExpenseApprovalPayload>({
    ...defaultApprovalState,
    expenseId: expense.id || expense._id || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      ...defaultApprovalState,
      expenseId: expense.id || expense._id || "",
    });
    setErrors({});
  }, [expense, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.status) {
      newErrors.status = "Status is required";
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
          <DialogTitle>Approve Expense {expense.title}</DialogTitle>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Status
            </label>
            <select
              className="rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none focus:border-ring focus:ring-ring/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={formData.status}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  status: event.target
                    .value as ExpenseApprovalPayload["status"],
                }))
              }
            >
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            {errors.status ? (
              <span className="text-sm text-red-600">{errors.status}</span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Note (optional)
            </label>
            <Input
              value={formData.note}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  note: event.target.value,
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
            <Button type="submit">Submit Approval</Button>
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
