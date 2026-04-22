"use client";

import { SaleReturn } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFormatCurrencyShort } from "@/hooks/useFormatCurrencyShort";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface SalesReturnsListProps {
  returns: SaleReturn[];
  onViewDetails: (saleReturn: SaleReturn) => void;
}

export function SalesReturnsList({
  returns,
  onViewDetails,
}: SalesReturnsListProps) {
  const formatCurrencyShort = useFormatCurrencyShort();
  const [expandedReturn, setExpandedReturn] = useState<string | null>(null);

  if (returns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-slate-400">
          No returns recorded for this period
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {returns.map((saleReturn) => {
        const isExpanded = expandedReturn === saleReturn.id;

        return (
          <div
            key={saleReturn.id || saleReturn._id}
            className="border border-amber-200 dark:border-amber-700 rounded-lg bg-amber-50 dark:bg-slate-800 overflow-hidden"
          >
            {/* Main Row */}
            <div className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Return Reference */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-slate-400">
                      Return #
                    </p>
                    <p className="font-mono font-semibold text-gray-900 dark:text-slate-100 text-sm">
                      {saleReturn.reference ||
                        `RTN-${saleReturn.id?.slice(0, 8)}`}
                    </p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-slate-400">
                      Date
                    </p>
                    <p className="text-sm text-gray-900 dark:text-slate-100">
                      {saleReturn.createdAt
                        ? new Date(saleReturn.createdAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>

                  {/* Items Returned */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-slate-400">
                      Items
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      {saleReturn.items?.length || 0} item
                      {saleReturn.items?.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Reason */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-slate-400">
                      Reason
                    </p>
                    <p className="text-sm text-gray-700 dark:text-slate-300 line-clamp-1">
                      {saleReturn.reason || "—"}
                    </p>
                  </div>

                  {/* Refund Amount */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-slate-400">
                      Refund Amount
                    </p>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                      {formatCurrencyShort(
                        saleReturn.refundAmount || saleReturn.totalAmount || 0,
                      )}
                    </p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      saleReturn.status === "completed"
                        ? "default"
                        : "secondary"
                    }
                    className="whitespace-nowrap"
                  >
                    {saleReturn.status || "pending"}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setExpandedReturn(
                          isExpanded
                            ? null
                            : saleReturn.id || saleReturn._id || "",
                        )
                      }
                      className="dark:hover:bg-slate-700"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => onViewDetails(saleReturn)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-750 p-4 space-y-4">
                {/* Refund Method */}
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Refund Method
                  </p>
                  <p className="text-gray-900 dark:text-slate-100">
                    {saleReturn.refundMethod || "—"}
                  </p>
                </div>

                {/* Items Returned */}
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">
                    Items Returned
                  </p>
                  <div className="space-y-2">
                    {saleReturn.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-slate-800 rounded"
                      >
                        <span className="text-gray-700 dark:text-slate-300">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-slate-100">
                          {formatCurrencyShort(item.total || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {saleReturn.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-gray-700 dark:text-slate-300">
                      {saleReturn.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
