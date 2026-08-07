"use client";

import type { WorkforceAdvanceType } from "@/lib/types";

interface ApprovalQueueProps {
  workers: Array<{ fullName?: string; status?: string }>;
  advances: WorkforceAdvanceType[];
}

export function ApprovalQueue({ workers, advances }: ApprovalQueueProps) {
  const pendingAdvances = advances.filter(
    (advance) => advance.status === "pending",
  );
  const pendingItems = [
    ...pendingAdvances.slice(0, 2).map((advance, index) => ({
      label: `Advance request ${index + 1}`,
      subtitle: `Outstanding KES ${advance.outstandingBalance ?? advance.amount ?? 0}`,
    })),
    ...workers.slice(0, 2).map((worker, index) => ({
      label: worker.fullName || `Worker ${index + 1}`,
      subtitle:
        worker.status === "active" ? "Attendance review" : "Profile review",
    })),
  ].slice(0, 2);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Approval queue
          </h3>
          <p className="text-sm text-slate-500">
            Pending actions for attendance and advances.
          </p>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
          {pendingAdvances.length + workers.length} pending
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {pendingItems.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <div>
              <div className="font-medium text-slate-900">{item.label}</div>
              <div className="text-slate-500">{item.subtitle}</div>
            </div>
            <button className="rounded-full border border-teal-200 px-2.5 py-1 text-xs font-semibold text-teal-700">
              Review
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
