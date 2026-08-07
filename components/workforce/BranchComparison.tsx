"use client";

import type { Branch } from "@/lib/types";

interface BranchComparisonProps {
  branches: Branch[];
  workers: Array<{ branchId?: string | null; status?: string }>;
}

export function BranchComparison({ branches, workers }: BranchComparisonProps) {
  const branchStats = branches.map((branch) => {
    const branchId = branch.id || branch._id;
    const activeWorkers = workers.filter(
      (worker) => worker.branchId === branchId,
    ).length;

    return {
      name: branch.branchName || "Unnamed branch",
      activeWorkers,
    };
  });

  const maxActive = Math.max(
    ...branchStats.map((item) => item.activeWorkers),
    1,
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Branch comparison
          </h3>
          <p className="text-sm text-slate-500">
            Quick view of staffing levels across locations.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          Multi-branch ready
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {branchStats.map((branch) => (
          <div
            key={branch.name}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900">{branch.name}</span>
              <span className="text-slate-600">
                {branch.activeWorkers} active
              </span>
            </div>
            <div className="mt-2 h-2.5 rounded-full bg-slate-200">
              <div
                className="h-2.5 rounded-full bg-teal-600"
                style={{
                  width: `${Math.round(
                    (branch.activeWorkers / maxActive) * 100,
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
