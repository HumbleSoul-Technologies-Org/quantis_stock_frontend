"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { ExpensePaymentForm } from "@/components/expenses/ExpensePaymentForm";
import { ExpenseApprovalForm } from "@/components/expenses/ExpenseApprovalForm";
import {
  fetchExpenseCategories,
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  createExpensePayment,
  createExpenseApproval,
} from "@/components/expenses/expenseService";
import type {
  Expense,
  ExpenseCategory,
  ExpensePaymentPayload,
  ExpenseApprovalPayload,
} from "@/lib/types";

export default function ExpensesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isManufacturer = user?.business?.businessType === "manufacturer";

  useEffect(() => {
    if (user && !isManufacturer) {
      router.replace("/dashboard");
    }
  }, [user, isManufacturer, router]);

  if (user && !isManufacturer) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Unauthorized</h1>
        <p className="mt-2 text-sm text-slate-500">
          Expense management is only available for manufacturing business types.
        </p>
      </div>
    );
  }

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();
  const [selectedPaymentExpense, setSelectedPaymentExpense] = useState<
    Expense | undefined
  >();
  const [selectedApprovalExpense, setSelectedApprovalExpense] = useState<
    Expense | undefined
  >();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const [paymentError, setPaymentError] = useState<string>("");
  const [approvalError, setApprovalError] = useState<string>("");

  const loadData = async () => {
    if (!user?.token || !user?.businessId) return;
    setIsLoading(true);
    try {
      const [categoryData, expenseData] = await Promise.all([
        fetchExpenseCategories(user.token, user.businessId),
        fetchExpenses(user.token, user.businessId),
      ]);
      setCategories(categoryData);
      setExpenses(expenseData);
    } catch (error) {
      console.error("Failed to load expenses", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [user?.token, user?.businessId]);

  const handleCreate = async (expense: Partial<Expense>) => {
    if (!user?.token) return;
    setServerError("");

    try {
      await createExpense(expense, user.token);
      setIsDialogOpen(false);
      setSelectedExpense(undefined);
      await loadData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save expense";
      setServerError(message);
    }
  };

  const handleUpdate = async (expense: Partial<Expense>) => {
    if (!user?.token || !expense.id) return;
    setServerError("");

    try {
      await updateExpense(expense.id, expense, user.token);
      setIsDialogOpen(false);
      setSelectedExpense(undefined);
      await loadData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update expense";
      setServerError(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.token) return;
    try {
      await deleteExpense(id, user.token);
      await loadData();
    } catch (error) {
      console.error("Failed to delete expense", error);
    }
  };

  const handleOpenPaymentDialog = (expense: Expense) => {
    setSelectedPaymentExpense(expense);
    setPaymentError("");
    setIsPaymentDialogOpen(true);
  };

  const handleOpenApprovalDialog = (expense: Expense) => {
    setSelectedApprovalExpense(expense);
    setApprovalError("");
    setIsApprovalDialogOpen(true);
  };

  const handleCreatePayment = async (payment: ExpensePaymentPayload) => {
    if (!user?.token) return;
    try {
      await createExpensePayment(payment, user.token);
      setIsPaymentDialogOpen(false);
      setSelectedPaymentExpense(undefined);
      await loadData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to record payment";
      setPaymentError(message);
    }
  };

  const handleCreateApproval = async (approval: ExpenseApprovalPayload) => {
    if (!user?.token) return;
    try {
      await createExpenseApproval(approval, user.token);
      setIsApprovalDialogOpen(false);
      setSelectedApprovalExpense(undefined);
      await loadData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to submit approval";
      setApprovalError(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Expense Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track expense records, approvals, and payment status.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>New Expense</Button>
      </div>

      <ExpenseTable
        expenses={expenses}
        onEdit={(expense) => {
          setSelectedExpense(expense);
          setIsDialogOpen(true);
        }}
        onPay={handleOpenPaymentDialog}
        onApprove={handleOpenApprovalDialog}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <ExpenseForm
        isOpen={isDialogOpen}
        expense={selectedExpense}
        categories={categories}
        onSubmit={selectedExpense ? handleUpdate : handleCreate}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedExpense(undefined);
        }}
        serverError={serverError}
      />

      {selectedPaymentExpense ? (
        <ExpensePaymentForm
          isOpen={isPaymentDialogOpen}
          expense={selectedPaymentExpense}
          onSubmit={handleCreatePayment}
          onOpenChange={(open) => {
            setIsPaymentDialogOpen(open);
            if (!open) setSelectedPaymentExpense(undefined);
          }}
          serverError={paymentError}
        />
      ) : null}

      {selectedApprovalExpense ? (
        <ExpenseApprovalForm
          isOpen={isApprovalDialogOpen}
          expense={selectedApprovalExpense}
          onSubmit={handleCreateApproval}
          onOpenChange={(open) => {
            setIsApprovalDialogOpen(open);
            if (!open) setSelectedApprovalExpense(undefined);
          }}
          serverError={approvalError}
        />
      ) : null}
    </div>
  );
}
