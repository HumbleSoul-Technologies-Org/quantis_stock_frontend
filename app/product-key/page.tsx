import { ProductKeyForm } from "@/components/auth/ProductKeyForm";

export const dynamic = "force-dynamic";

export default function ProductKeyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              StockOS
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Inventory Management System
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm italic">
              "Streamline your inventory, boost your business"
            </p>
          </div>
        </div>

        <ProductKeyForm />
      </div>
    </div>
  );
}
