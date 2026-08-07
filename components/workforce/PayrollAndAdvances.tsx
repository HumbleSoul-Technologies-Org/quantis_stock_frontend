"use client";

import { useMemo } from "react";
import type {
  AdvanceDeduction,
  Payslip,
  PayrollEntry,
  WorkforceAdvanceType,
  WorkforcePayrollRunType,
} from "@/lib/types";

interface PayrollAndAdvancesProps {
  workers: Array<{
    id?: string;
    _id?: string;
    fullName?: string;
    status?: string;
  }>;
  payrollRuns: WorkforcePayrollRunType[];
  advances: WorkforceAdvanceType[];
  payrollEntries: PayrollEntry[];
  payslips: Payslip[];
  advanceDeductions: AdvanceDeduction[];
  onEditRun?: (run: WorkforcePayrollRunType) => void;
  onDeleteRun?: (id: string) => Promise<void> | void;
  onEditEntry?: (entry: PayrollEntry) => void;
  onDeleteEntry?: (id: string) => Promise<void> | void;
  onEditAdvance?: (advance: WorkforceAdvanceType) => void;
  onDeleteAdvance?: (id: string) => Promise<void> | void;
  onEditPayslip?: (payslip: Payslip) => void;
  onDeletePayslip?: (id: string) => Promise<void> | void;
  onEditAdvanceDeduction?: (deduction: AdvanceDeduction) => void;
  onDeleteAdvanceDeduction?: (id: string) => Promise<void> | void;
}

export function PayrollAndAdvances({
  workers,
  payrollRuns,
  advances,
  payrollEntries,
  payslips,
  advanceDeductions,
  onEditRun,
  onDeleteRun,
  onEditEntry,
  onDeleteEntry,
  onEditAdvance,
  onDeleteAdvance,
  onEditPayslip,
  onDeletePayslip,
  onEditAdvanceDeduction,
  onDeleteAdvanceDeduction,
}: PayrollAndAdvancesProps) {
  const summary = useMemo(
    () => ({
      totalPayroll:
        payrollRuns.reduce((sum, run) => sum + (run.totalGross ?? 0), 0) ||
        workers.length * 15000,
      totalDeductions:
        payrollRuns.reduce((sum, run) => sum + (run.totalDeductions ?? 0), 0) ||
        12000,
      totalNet:
        payrollRuns.reduce((sum, run) => sum + (run.totalNet ?? 0), 0) ||
        Math.max(0, workers.length * 15000 - 12000),
      pendingAdvances: advances.reduce(
        (sum, advance) =>
          sum + (advance.outstandingBalance ?? advance.amount ?? 0),
        0,
      ),
      advanceRequests: advances.length,
    }),
    [workers.length, payrollRuns, advances],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Payroll run
              </h3>
              <p className="text-sm text-slate-500">
                Preview the current cycle for active workers.
              </p>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
              Ready
            </span>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>Base payroll</span>
              <span className="font-semibold text-slate-900">
                KES {summary.totalPayroll}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>Estimated deductions</span>
              <span className="font-semibold text-slate-900">
                KES {summary.totalDeductions}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>Net payroll</span>
              <span className="font-semibold text-slate-900">
                KES {summary.totalNet}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Advances</h3>
              <p className="text-sm text-slate-500">
                Outstanding salary advances and repayment status.
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
              Pending
            </span>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>Outstanding balance</span>
              <span className="font-semibold text-slate-900">
                KES {summary.pendingAdvances}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>Advance requests</span>
              <span className="font-semibold text-slate-900">
                {summary.advanceRequests}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">
          Recent payroll entries
        </h4>
        <p className="text-sm text-slate-500">
          Edit or remove recent payroll entries.
        </p>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {payrollEntries.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-500">
              No payroll entries yet.
            </div>
          ) : (
            payrollEntries.slice(0, 6).map((entry) => (
              <div
                key={entry.id || entry._id}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">
                      {entry.workerId ?? "—"}
                    </div>
                    <div className="text-sm text-slate-600">
                      Net: KES {entry.netPay ?? 0} — {entry.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onEditEntry ? (
                      <button
                        type="button"
                        className="text-xs text-slate-600"
                        onClick={() => onEditEntry(entry)}
                      >
                        Edit
                      </button>
                    ) : null}
                    {onDeleteEntry ? (
                      <button
                        type="button"
                        className="text-xs text-rose-600"
                        onClick={() =>
                          onDeleteEntry(entry.id || entry._id || "")
                        }
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="text-base font-semibold text-slate-900">
            Recent payroll runs
          </h4>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {payrollRuns.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-500">
                No payroll runs yet.
              </div>
            ) : (
              payrollRuns.slice(0, 3).map((run) => (
                <div
                  key={run.id || run._id}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {run.periodStart ?? "—"} → {run.periodEnd ?? "—"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase text-slate-600">
                        {run.status}
                      </span>
                      {onEditRun ? (
                        <button
                          type="button"
                          className="text-xs text-slate-600"
                          onClick={() => onEditRun(run)}
                        >
                          Edit
                        </button>
                      ) : null}
                      {onDeleteRun ? (
                        <button
                          type="button"
                          className="text-xs text-rose-600"
                          onClick={() => onDeleteRun(run.id || run._id || "")}
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
                    <span>Total net</span>
                    <span>KES {run.totalNet ?? 0}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="text-base font-semibold text-slate-900">
            Recent advances
          </h4>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {advances.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-500">
                No advances logged yet.
              </div>
            ) : (
              advances.slice(0, 3).map((advance, index) => (
                <div
                  key={advance.id || advance._id || advance.workerId || index}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span>Worker {advance.workerId?.slice(0, 6) ?? "—"}</span>
                    <span className="text-xs uppercase text-slate-600">
                      {advance.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
                    <span>Outstanding</span>
                    <span>
                      KES {advance.outstandingBalance ?? advance.amount ?? 0}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-2">
                    {onEditAdvance ? (
                      <button
                        type="button"
                        className="text-xs text-slate-600"
                        onClick={() => onEditAdvance(advance)}
                      >
                        Edit
                      </button>
                    ) : null}
                    {onDeleteAdvance ? (
                      <button
                        type="button"
                        className="text-xs text-rose-600"
                        onClick={() =>
                          onDeleteAdvance(advance.id || advance._id || "")
                        }
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">
          Recent payslips
        </h4>
        <p className="text-sm text-slate-500">Manage generated payslips.</p>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {payslips.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-500">
              No payslips yet.
            </div>
          ) : (
            payslips.slice(0, 6).map((p) => (
              <div
                key={p.id || p._id}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">
                      Entry {p.entryId ?? "—"}
                    </div>
                    <div className="text-sm text-slate-600">
                      Issued: {p.issuedAt ?? "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onEditPayslip ? (
                      <button
                        type="button"
                        className="text-xs text-slate-600"
                        onClick={() => onEditPayslip(p)}
                      >
                        Edit
                      </button>
                    ) : null}
                    {onDeletePayslip ? (
                      <button
                        type="button"
                        className="text-xs text-rose-600"
                        onClick={() => onDeletePayslip(p.id || p._id || "")}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">
          Recent deductions
        </h4>
        <p className="text-sm text-slate-500">
          Advance deductions and repayment items.
        </p>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {advanceDeductions.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-500">
              No deductions yet.
            </div>
          ) : (
            advanceDeductions.slice(0, 6).map((d) => (
              <div
                key={d.id || d._id}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-900">
                    Advance {d.advanceId ?? "—"}
                  </div>
                  <div className="text-sm text-slate-600">
                    KES {d.amountDeducted ?? 0}
                  </div>
                  <div className="flex items-center gap-2">
                    {onEditAdvanceDeduction ? (
                      <button
                        type="button"
                        className="text-xs text-slate-600"
                        onClick={() => onEditAdvanceDeduction(d)}
                      >
                        Edit
                      </button>
                    ) : null}
                    {onDeleteAdvanceDeduction ? (
                      <button
                        type="button"
                        className="text-xs text-rose-600"
                        onClick={() =>
                          onDeleteAdvanceDeduction(d.id || d._id || "")
                        }
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
