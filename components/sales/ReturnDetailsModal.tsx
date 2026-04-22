"use client";

import { SaleReturn } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFormatCurrencyShort } from "@/hooks/useFormatCurrencyShort";
import {
  RotateCcw,
  DollarSign,
  CreditCard,
  FileText,
  Package,
} from "lucide-react";

interface ReturnDetailsModalProps {
  isOpen: boolean;
  saleReturn?: SaleReturn;
  onOpenChange: (open: boolean) => void;
}

export function ReturnDetailsModal({
  isOpen,
  saleReturn,
  onOpenChange,
}: ReturnDetailsModalProps) {
  const formatCurrencyShort = useFormatCurrencyShort();

  if (!saleReturn) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-600 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                Return Details
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {saleReturn.reference || `RTN-${saleReturn.id?.slice(0, 8)}`}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Return Information Card */}
          <Card className="border-2 border-amber-200 dark:border-amber-700 dark:bg-slate-800">
            <CardHeader className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-600">
              <CardTitle className="text-amber-900 dark:text-amber-100">
                Return Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-slate-400">
                    Status
                  </label>
                  <Badge
                    variant={
                      saleReturn.status === "completed"
                        ? "default"
                        : "secondary"
                    }
                    className="mt-2"
                  >
                    {saleReturn.status || "pending"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-slate-400">
                    Date
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-slate-100 mt-1">
                    {saleReturn.createdAt
                      ? new Date(saleReturn.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )
                      : "—"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-slate-400">
                    Return Reason
                  </label>
                  <p className="text-gray-900 dark:text-slate-100 mt-1">
                    {saleReturn.reason || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-slate-400">
                    Refund Method
                  </label>
                  <p className="text-gray-900 dark:text-slate-100 mt-1">
                    {saleReturn.refundMethod || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-2 border-amber-200 dark:border-amber-700 dark:bg-slate-800">
              <CardHeader className="bg-amber-50 dark:bg-slate-700">
                <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100 text-sm">
                  <DollarSign className="w-4 h-4" />
                  Total Return Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                  {formatCurrencyShort(saleReturn.totalAmount || 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 dark:border-green-700 dark:bg-slate-800">
              <CardHeader className="bg-green-50 dark:bg-slate-700">
                <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100 text-sm">
                  <CreditCard className="w-4 h-4" />
                  Refund Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrencyShort(
                    saleReturn.refundAmount || saleReturn.totalAmount || 0,
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Items Returned */}
          <Card className="border-2 border-amber-200 dark:border-amber-700 dark:bg-slate-800">
            <CardHeader className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-600">
              <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <Package className="w-5 h-5" />
                Items Returned
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {saleReturn.items && saleReturn.items.length > 0 ? (
                <div className="space-y-3">
                  {saleReturn.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-amber-100 dark:border-amber-700"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
                          Quantity
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-slate-100">
                          {item.quantity} unit(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
                          Unit Price
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-slate-100">
                          {formatCurrencyShort(item.unitPrice || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
                          Total
                        </p>
                        <p className="font-bold text-amber-700 dark:text-amber-300">
                          {formatCurrencyShort(item.total || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-slate-400">
                  No items in this return
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {saleReturn.notes && (
            <Card className="border-2 border-amber-200 dark:border-amber-700 dark:bg-slate-800">
              <CardHeader className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-600">
                <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                  <FileText className="w-5 h-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                  {saleReturn.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
