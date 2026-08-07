import { Button } from "@/components/ui/button";
import type { Expense } from "@/lib/types";

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onPay: (expense: Expense) => void;
  onApprove: (expense: Expense) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function ExpenseTable({
  expenses,
  onEdit,
  onPay,
  onApprove,
  onDelete,
  isLoading,
}: ExpenseTableProps) {
  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading expenses...</div>;
  }

  if (expenses.length === 0) {
    return <div className="text-sm text-slate-500">No expenses found.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700 dark:divide-slate-700 dark:text-slate-200">
        <thead className="bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-200">
          <tr>
            <th className="px-4 py-3 font-semibold">Title</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Amount</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Approval</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {expenses.map((expense) => (
            <tr
              key={expense.id || expense._id}
              className="odd:bg-slate-50 even:bg-white dark:odd:bg-slate-800 dark:even:bg-slate-900"
            >
              <td className="px-4 py-3">{expense.title}</td>
              <td className="px-4 py-3">
                {expense.categoryId || "Uncategorized"}
              </td>
              <td className="px-4 py-3">
                {expense.amount.toFixed(2)} {expense.currency}
              </td>
              <td className="px-4 py-3">
                {new Date(expense.expenseDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 capitalize">{expense.paymentStatus}</td>
              <td className="px-4 py-3 capitalize">{expense.approvalStatus}</td>
              <td className="px-4 py-3 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(expense)}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onPay(expense)}
                >
                  Pay
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onApprove(expense)}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(expense.id || expense._id || "")}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
