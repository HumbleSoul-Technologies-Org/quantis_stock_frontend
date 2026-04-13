"use client";

import { useState, useEffect } from "react";
import { Sale, SaleReturn, SaleReturnItem, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";

interface SalesReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (saleReturn: SaleReturn) => void;
  sale: Sale | null;
  products: Product[];
}

export function SalesReturnDialog({
  isOpen,
  onClose,
  onSubmit,
  sale,
  products,
}: SalesReturnDialogProps) {
  const { formatCurrency } = useSettings();
  const { user } = useAuth();
  const [returnItems, setReturnItems] = useState<SaleReturnItem[]>([]);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundMethod, setRefundMethod] = useState("");

  // Initialize return items when sale changes
  useEffect(() => {
    if (sale && isOpen) {
      const initialItems = sale.items.map((item) => ({
        productId: item.productId,
        quantity: 0, // Start with 0, user can increase
        unitPrice: item.unitPrice,
        total: 0,
      }));
      setReturnItems(initialItems);
      setReason("");
      setNotes("");
      setRefundAmount(0);
      setRefundMethod(sale.paymentType || "");
    }
  }, [sale, isOpen]);

  const getProductName = (productId: string) => {
    return products.find((p) => p._id === productId)?.name || "Unknown Product";
  };

  const getSoldQuantity = (productId: string) => {
    return (
      sale?.items.find((item) => item.productId === productId)?.quantity || 0
    );
  };

  const updateReturnQuantity = (productId: string, quantity: number) => {
    const soldQuantity = getSoldQuantity(productId);
    const validQuantity = Math.max(0, Math.min(quantity, soldQuantity));

    setReturnItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: validQuantity,
              total: validQuantity * item.unitPrice,
            }
          : item,
      ),
    );
  };

  const totalReturnAmount = returnItems.reduce(
    (sum, item) => sum + item.total,
    0,
  );
  const hasReturnItems = returnItems.some((item) => item.quantity > 0);

  const handleSubmit = () => {
    if (!sale || !user || !hasReturnItems) return;

    const returnRecord: SaleReturn = {
      id: Math.random().toString(36).substr(2, 9),
      saleId: sale.id || sale._id || "",
      items: returnItems.filter((item) => item.quantity > 0),
      totalAmount: totalReturnAmount,
      reason: reason || undefined,
      notes: notes || undefined,
      status: "completed",
      businessId: sale.businessId,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      reference: `RTN-${sale.saleNumber}-${Date.now()}`,
      refundAmount: refundAmount || totalReturnAmount,
      refundMethod: refundMethod || undefined,
    };

    onSubmit(returnRecord);
    onClose();
  };

  if (!sale) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Process Return for Sale {sale.saleNumber}</DialogTitle>
          <DialogDescription>
            Select items to return and specify return details. Only quantities
            that were sold can be returned.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sale Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Original Sale Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Customer:</strong> {sale.customerName || "N/A"}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(sale.date).toLocaleDateString()}
                </div>
                <div>
                  <strong>Payment:</strong> {sale.paymentType || "N/A"}
                </div>
                <div>
                  <strong>Total:</strong> {formatCurrency(sale.totalAmount)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Return Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {returnItems.map((item) => {
                  const soldQuantity = getSoldQuantity(item.productId);
                  return (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {getProductName(item.productId)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Sold: {soldQuantity} | Unit Price:{" "}
                          {formatCurrency(item.unitPrice)}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Label
                            htmlFor={`quantity-${item.productId}`}
                            className="text-sm"
                          >
                            Return Qty
                          </Label>
                          <Input
                            id={`quantity-${item.productId}`}
                            type="number"
                            min="0"
                            max={soldQuantity}
                            value={item.quantity}
                            onChange={(e) =>
                              updateReturnQuantity(
                                item.productId,
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-20 mt-1"
                          />
                        </div>
                        <div className="text-right min-w-[100px]">
                          <div className="text-sm text-gray-600">Total</div>
                          <div className="font-medium">
                            {formatCurrency(item.total)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Return Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Return Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reason">Return Reason</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Defective, Wrong item, Customer change of mind"
                  />
                </div>
                <div>
                  <Label htmlFor="refundAmount">Refund Amount</Label>
                  <Input
                    id="refundAmount"
                    type="number"
                    step="0.01"
                    value={refundAmount}
                    onChange={(e) =>
                      setRefundAmount(parseFloat(e.target.value) || 0)
                    }
                    placeholder="Leave empty to use calculated amount"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="refundMethod">Refund Method</Label>
                  <Input
                    id="refundMethod"
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    placeholder="e.g., Cash, Card, Bank Transfer"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes about the return"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-medium">Total Return Amount</div>
                  <div className="text-sm text-gray-600">
                    {returnItems.filter((item) => item.quantity > 0).length}{" "}
                    item(s) being returned
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalReturnAmount)}
                  </div>
                  {refundAmount > 0 && refundAmount !== totalReturnAmount && (
                    <div className="text-sm text-gray-600">
                      Refund: {formatCurrency(refundAmount)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasReturnItems}
            className="bg-green-600 hover:bg-green-700"
          >
            Process Return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
