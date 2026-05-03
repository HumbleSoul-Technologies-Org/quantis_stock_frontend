import { cn } from "@/lib/utils";

interface CardSkeletonProps {
  count?: number;
  className?: string;
  showChart?: boolean;
  showBadge?: boolean;
  showButton?: boolean;
  gridCols?: string;
}

export function CardSkeleton({
  count = 3,
  className,
  showChart = true,
  showBadge = false,
  showButton = false,
  gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
}: CardSkeletonProps) {
  return (
    <div className={cn("grid gap-4", gridCols, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`card-${i}`}
          className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-teal-700 rounded-lg shadow relative overflow-hidden"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        >
          {/* Card Header */}
          <div className="p-4 pb-3 border-b border-gray-100 dark:border-slate-700 relative z-10">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 space-y-2">
                {/* Title */}
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 opacity-60"></div>
                {/* Subtitle */}
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 opacity-60"></div>
              </div>
              {/* Optional Badge */}
              {showBadge && (
                <div className="h-5 w-12 bg-red-200 dark:bg-red-900 rounded-full opacity-60"></div>
              )}
            </div>
          </div>

          {/* Card Content */}
          <div className="p-4 space-y-4 relative z-10">
            {/* Chart Placeholder */}
            {showChart && (
              <div className="h-36 flex items-center justify-center relative">
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full opacity-60"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto opacity-60"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto opacity-60"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, detailIndex) => (
                <div
                  key={`detail-${detailIndex}`}
                  className="flex justify-between items-center"
                >
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 opacity-60"></div>
                  <div
                    className={cn(
                      "h-3 bg-gray-200 dark:bg-gray-700 rounded opacity-60",
                      detailIndex % 2 === 0 ? "w-12" : "w-20",
                    )}
                  ></div>
                </div>
              ))}
            </div>

            {/* Optional Button */}
            {showButton && (
              <div className="h-9 bg-green-200 dark:bg-teal-900 rounded-md w-full mt-4 opacity-60"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
