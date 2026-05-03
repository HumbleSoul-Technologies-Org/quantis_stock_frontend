import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rows?: number;
  className?: string;
  showHeader?: boolean;
  columnWidths?: string[];
}

export function TableSkeleton({
  rows = 7,
  className,
  showHeader = true,
  columnWidths = ["20%", "20%", "15%", "15%", "10%", "10%", "5%", "5%"], // Default widths for supplier table
}: TableSkeletonProps) {
  // Limit rows to max 7 as per plan
  const actualRows = Math.min(rows, 7);

  return (
    <div className={cn("w-full", className)}>
      <div
        className="border border-gray-200 dark:border-teal-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 relative"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }}
      >
        {/* Table Header */}
        {showHeader && (
          <div className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-teal-700 relative z-10">
            <div className="flex">
              {columnWidths.map((width, i) => (
                <div
                  key={`header-${i}`}
                  className="p-3 border-r border-gray-200 dark:border-teal-700 last:border-r-0"
                  style={{ width }}
                >
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded opacity-60"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table Body */}
        <div className="divide-y divide-gray-200 dark:divide-teal-700 relative z-10">
          {Array.from({ length: actualRows }).map((_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="flex hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              {columnWidths.map((width, colIndex) => (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="p-3 border-r border-gray-200 dark:border-teal-700 last:border-r-0"
                  style={{ width }}
                >
                  <div
                    className={cn(
                      "bg-gray-200 dark:bg-gray-700 rounded opacity-60",
                      // Vary heights for more realistic look
                      colIndex === 0
                        ? "h-4" // Name column - slightly taller
                        : colIndex === 1
                          ? "h-3" // Email column
                          : colIndex === 2
                            ? "h-3" // Phone column
                            : colIndex === 3
                              ? "h-3" // Location column
                              : colIndex === 4
                                ? "h-6 w-6 rounded-full mx-auto" // Products column - icon
                                : colIndex === 5
                                  ? "h-3" // Payment Terms column
                                  : colIndex === 6
                                    ? "h-5 w-12 rounded-full mx-auto" // Status column - badge
                                    : "h-8 w-8 rounded mx-auto", // Actions column - button
                    )}
                  ></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
