import BranchManagement from "@/components/settings/BranchManagement";

export default function DashboardBranchesPage() {
  return (
    <div className="space-y-6">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-teal-100">
          Branch Management
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 mt-1 sm:mt-2">
          Create and manage branches, then assign users and review branch-level
          activity.
        </p>
      </div>

      <BranchManagement />
    </div>
  );
}
