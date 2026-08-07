import { Button } from "@/components/ui/button";
import type { Asset, AssetCategory, Branch } from "@/lib/types";

interface AssetTableProps {
  assets: Asset[];
  categories: AssetCategory[];
  branches: Branch[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function AssetTable({
  assets,
  categories,
  branches,
  onEdit,
  onDelete,
  isLoading,
}: AssetTableProps) {
  const categoryMap = new Map(
    categories.map((category) => [category.id || category._id, category.name]),
  );
  const branchMap = new Map(
    branches.map((branch) => [branch.id || branch._id, branch.branchName]),
  );

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading assets...</div>;
  }

  if (assets.length === 0) {
    return <div className="text-sm text-slate-500">No assets found.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700 dark:divide-slate-700 dark:text-slate-200">
        <thead className="bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-200">
          <tr>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Branch</th>
            <th className="px-4 py-3 font-semibold">Cost</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {assets.map((asset) => (
            <tr
              key={asset.id || asset._id}
              className="odd:bg-slate-50 even:bg-white dark:odd:bg-slate-800 dark:even:bg-slate-900"
            >
              <td className="px-4 py-3">{asset.name}</td>
              <td className="px-4 py-3 capitalize">{asset.assetType}</td>
              <td className="px-4 py-3">
                {categoryMap.get(asset.categoryId) ||
                  asset.categoryId ||
                  "Unknown"}
              </td>
              <td className="px-4 py-3">
                {asset.branchId
                  ? branchMap.get(asset.branchId) || asset.branchId
                  : "All"}
              </td>
              <td className="px-4 py-3">{asset.acquisitionCost.toFixed(2)}</td>
              <td className="px-4 py-3 capitalize">{asset.status}</td>
              <td className="px-4 py-3 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(asset)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(asset.id || asset._id || "")}
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
