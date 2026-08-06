"use client";

import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { StockMovementForm } from "@/components/inventory/StockMovementForm";
import { StockHistoryTable } from "@/components/inventory/StockHistoryTable";
import { Product, StockMovement } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Package, Layers, Plus, AlertCircle } from "lucide-react";

export default function RawMaterialsPage() {
  const {
    products,
    stockMovements,
    addStockMovement,
    isInitialLoadingStock,
    logActivity,
  } = useData();
  const { user } = useAuth();
  const { notifyResourceCreated, notifySuccess, notifyError } =
    useNotificationActions();

  const safeProducts = Array.isArray(products) ? products : [];
  const safeStockMovements = Array.isArray(stockMovements)
    ? stockMovements
    : [];

  const rawMaterialMovements = useMemo(
    () =>
      safeStockMovements.filter(
        (movement) => movement.stockStage === "raw_material",
      ),
    [safeStockMovements],
  );

  const rawMaterialProductIds = useMemo(
    () => new Set(rawMaterialMovements.map((movement) => movement.productId)),
    [rawMaterialMovements],
  );

  const rawMaterialProducts = useMemo(
    () =>
      safeProducts.filter(
        (product) =>
          product?.category === "raw_material" ||
          product?.productStage === "raw material" ||
          rawMaterialProductIds.has(product._id || product.id || ""),
      ),
    [safeProducts, rawMaterialProductIds],
  );

  const [showDialog, setShowDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [stockMovementFormError, setStockMovementFormError] = useState("");

  const getMovementDelta = (movement: StockMovement) => {
    if (movement.type === "in") return movement.quantity;
    if (movement.type === "out") return -movement.quantity;

    const triggerText =
      `${movement.reason || ""} ${movement.movementCategory || ""}`.toLowerCase();
    const negativeTriggers = [
      "write-off",
      "writeoff",
      "waste",
      "wasted",
      "damage",
      "damaged",
      "expiry",
      "expired",
      "theft",
      "loss",
      "lost",
      "rejected",
    ];

    return negativeTriggers.some((trigger) => triggerText.includes(trigger))
      ? -movement.quantity
      : movement.quantity;
  };

  const rawMaterialBalance = rawMaterialMovements.reduce(
    (sum, movement) => sum + getMovementDelta(movement),
    0,
  );

  const totalRawMaterialIn = rawMaterialMovements.filter(
    (m) => m.type === "in",
  ).length;
  const totalRawMaterialOut = rawMaterialMovements.filter(
    (m) => m.type === "out",
  ).length;

  const selectedMovements = rawMaterialMovements;

  const handleAddMovement = async (movement: StockMovement) => {
    try {
      await addStockMovement(movement);

      const product = safeProducts.find(
        (item) =>
          item._id === movement.productId || item.id === movement.productId,
      );
      const productName = product?.name || "Unknown Raw Material";

      await logActivity({
        type: "stock",
        action: "create",
        status: "success",
        title: `Raw material movement for ${productName}`,
        description: `Recorded ${movement.type} for ${movement.quantity} units of ${productName}`,
        referenceId: movement.id || movement._id,
        entityType: "stockMovement",
        entityId: movement.id || movement._id,
        metadata: {
          productName,
          productId: movement.productId,
          type: movement.type,
          quantity: movement.quantity,
          stockStage: movement.stockStage,
        },
        businessId: user?.businessId,
        createdBy: user?.id || user?._id || "",
      });

      notifyResourceCreated(
        "Raw material movement",
        `${movement.type} for ${productName}`,
      );
      notifySuccess(
        "Raw Material Recorded",
        `${movement.quantity} units of ${productName} were recorded.`,
      );
      setShowDialog(false);
      setStockMovementFormError("");
      setSelectedProductId("");
    } catch (error: unknown) {
      notifyError(
        "Unable to record raw material movement.",
        "Please try again.",
      );
      setStockMovementFormError(
        error instanceof Error
          ? error.message
          : "Unable to save the raw material movement. Please try again.",
      );
      throw error;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-linear-to-r from-slate-900 to-slate-700 rounded-xl p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Layers className="w-8 h-8" />
              <h1 className="text-3xl sm:text-4xl font-bold">
                Raw Material Management
              </h1>
            </div>
            <p className="text-slate-200 text-lg">
              Track material inflows, usage, and balance for raw materials used
              in production.
            </p>
          </div>
          {((user && user.role === "manager") || user?.role === "admin") && (
            <Button
              onClick={() => {
                setSelectedProductId("");
                setStockMovementFormError("");
                setShowDialog(true);
              }}
              className="bg-white text-slate-900 hover:bg-slate-100 gap-2 w-full sm:w-auto font-semibold"
            >
              <Plus className="w-5 h-5" />
              Record Raw Material
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-teal-200 dark:border-teal-700">
          <CardHeader>
            <CardTitle>Raw Material Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {rawMaterialBalance}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Net raw material stock value
            </p>
          </CardContent>
        </Card>
        <Card className="border-teal-200 dark:border-teal-700">
          <CardHeader>
            <CardTitle>Movements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {rawMaterialMovements.length}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total raw material movements
            </p>
          </CardContent>
        </Card>
        <Card className="border-teal-200 dark:border-teal-700">
          <CardHeader>
            <CardTitle>Tracked Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {rawMaterialProducts.length}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Products tagged as raw materials
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-teal-200 dark:border-teal-700">
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <StockHistoryTable
            movements={selectedMovements}
            products={safeProducts}
          />
        </CardContent>
      </Card>

      {user && (
        <Dialog
          open={showDialog}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedProductId("");
              setStockMovementFormError("");
            }
            setShowDialog(open);
          }}
        >
          <DialogContent
            disableOutsideClick
            disableEscape
            className="max-w-2xl dark:bg-slate-800"
          >
            <DialogHeader>
              <DialogTitle>Record Raw Material Movement</DialogTitle>
              <DialogDescription>
                Record raw material movement details, including quantity,
                source, packaging, and production usage information.
              </DialogDescription>
            </DialogHeader>
            <StockMovementForm
              products={products}
              serverError={stockMovementFormError}
              onSubmit={async (movement) => {
                await handleAddMovement({
                  ...movement,
                  stockStage: "raw_material",
                });
              }}
              onCancel={() => {
                setStockMovementFormError("");
                setShowDialog(false);
                setSelectedProductId("");
              }}
              currentUserId={user.id}
              preselectedProductId={selectedProductId}
              allowedStockStages={["raw_material"]}
              defaultStockStage="raw_material"
              showManufacturingFields={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
