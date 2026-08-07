"use client";

import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { RawMaterial, RawMaterialMovement } from "@/lib/types";
import { buildRawMaterialSummary } from "@/lib/rawMaterials";
import { computeProduced } from "@/lib/productionUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Layers,
  Plus,
  Eye,
  Edit3,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const emptyMaterialForm = {
  name: "",
  code: "",
  category: "",
  description: "",
  unitOfMeasure: "kg",
  packagingUnit: "",
  quantityPerPack: "0",
  subUnitSize: "0",
  totalEquivalentQuantity: "0",
  openingBalance: "0",
  currentStockBalance: "0",
  quantityReceived: "0",
  quantityUsed: "0",
  quantityWasted: "0",
  reorderLevel: "0",
  minimumStockLevel: "0",
  maximumStockLevel: "0",
  supplier: "",
  purchasePrice: "0",
  currency: "USD",
  storageLocation: "",
  storageCondition: "",
  expiryDate: "",
  handlingNotes: "",
};

const emptyMovementForm = {
  movementType: "received" as RawMaterialMovement["movementType"],
  quantity: "0",
  reason: "Purchase",
  notes: "",
};

const emptyProductionForm = {
  productId: "",
  date: new Date().toISOString().slice(0, 10),
  bulkUnitKey: "",
  bulkUnitValue: "",
  openingStock: 0,
  closingStock: 0,
  damagedQuantity: 0,
  sales: 0,
  notes: "",
};

type ProductionHistoryEntry = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  bulkUnitLabel?: string;
  openingStock?: number;
  closingStock?: number;
  damagedQuantity: number;
  sales?: number;
  date: string;
  notes: string;
};

export default function RawMaterialsPage() {
  const {
    rawMaterials,
    rawMaterialMovements,
    products,
    addRawMaterial,
    addRawMaterialMovement,
    traceProduction,
    logActivity,
  } = useData();
  const { user } = useAuth();
  const { notifyResourceCreated, notifySuccess, notifyError } =
    useNotificationActions();

  const safeRawMaterials = Array.isArray(rawMaterials) ? rawMaterials : [];
  const safeRawMaterialMovements = Array.isArray(rawMaterialMovements)
    ? rawMaterialMovements
    : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [movementTarget, setMovementTarget] = useState<RawMaterial | null>(
    null,
  );
  const [movementForm, setMovementForm] = useState(emptyMovementForm);
  const [materialForm, setMaterialForm] = useState({ ...emptyMaterialForm });
  const [productionForm, setProductionForm] = useState({
    ...emptyProductionForm,
  });
  const [productionHistory, setProductionHistory] = useState<
    ProductionHistoryEntry[]
  >([]);
  const [selectedHistory, setSelectedHistory] =
    useState<ProductionHistoryEntry | null>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showMaterialDetails, setShowMaterialDetails] =
    useState<RawMaterial | null>(null);

  const materialSummaries = useMemo(() => {
    return safeRawMaterials.map((material) => {
      const materialId = material._id || material.id || "";
      const relatedMovements = safeRawMaterialMovements.filter(
        (movement) => movement.rawMaterialId === materialId,
      );

      return {
        material,
        summary: buildRawMaterialSummary(material, relatedMovements),
      };
    });
  }, [safeRawMaterials, safeRawMaterialMovements]);

  const totalBalance = materialSummaries.reduce(
    (sum, item) => sum + item.summary.currentBalance,
    0,
  );
  const totalReceived = materialSummaries.reduce(
    (sum, item) => sum + item.summary.totalReceived,
    0,
  );
  const totalUsed = materialSummaries.reduce(
    (sum, item) => sum + item.summary.totalUsed,
    0,
  );
  const totalWasted = materialSummaries.reduce(
    (sum, item) => sum + item.summary.totalWasted,
    0,
  );

  const selectedProduct = useMemo(
    () =>
      safeProducts.find(
        (product) =>
          product._id === productionForm.productId ||
          product.id === productionForm.productId,
      ),
    [safeProducts, productionForm.productId],
  );

  const producedQuantity = useMemo(
    () =>
      computeProduced(
        productionForm.openingStock,
        productionForm.closingStock,
        productionForm.sales,
        productionForm.damagedQuantity,
      ),
    [
      productionForm.openingStock,
      productionForm.closingStock,
      productionForm.sales,
      productionForm.damagedQuantity,
    ],
  );

  const bomUsage = useMemo(() => {
    if (!selectedProduct?.bom?.length) return [];
    return selectedProduct.bom.map((component) => {
      const componentProduct = safeProducts.find(
        (product) =>
          product._id === component.componentId ||
          product.id === component.componentId,
      );
      return {
        rawMaterialId: component.componentId || "",
        name: componentProduct?.name || "Unknown component",
        quantity:
          Number(component.quantity || 0) * Math.max(producedQuantity, 0),
        unit: component.unit || "units",
      };
    });
  }, [producedQuantity, safeProducts, selectedProduct]);

  const todayProductionTotal = productionHistory.reduce(
    (sum, entry) => sum + entry.quantity,
    0,
  );
  const todayDamagesTotal = productionHistory.reduce(
    (sum, entry) => sum + entry.damagedQuantity,
    0,
  );
  const todayRawMaterialsUsedTotal = bomUsage.reduce(
    (sum, usage) => sum + usage.quantity,
    0,
  );

  const handleAddMaterial = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!materialForm.name.trim()) {
      notifyError(
        "Material name is required",
        "Please provide a raw material name.",
      );
      return;
    }

    try {
      const materialPayload: RawMaterial = {
        ...materialForm,
        name: materialForm.name.trim(),
        quantityPerPack: Number(materialForm.quantityPerPack) || 0,
        subUnitSize: Number(materialForm.subUnitSize) || 0,
        totalEquivalentQuantity:
          Number(materialForm.totalEquivalentQuantity) || 0,
        openingBalance: Number(materialForm.openingBalance) || 0,
        currentStockBalance:
          Number(materialForm.currentStockBalance) ||
          Number(materialForm.openingBalance) ||
          0,
        quantityReceived: Number(materialForm.quantityReceived) || 0,
        quantityUsed: Number(materialForm.quantityUsed) || 0,
        quantityWasted: Number(materialForm.quantityWasted) || 0,
        reorderLevel: Number(materialForm.reorderLevel) || 0,
        minimumStockLevel: Number(materialForm.minimumStockLevel) || 0,
        maximumStockLevel: Number(materialForm.maximumStockLevel) || 0,
        purchasePrice: Number(materialForm.purchasePrice) || 0,
        branchId: user?.branchId,
        businessId: user?.businessId,
      };

      const createdMaterial = await addRawMaterial(materialPayload);
      const materialId = createdMaterial?.id || createdMaterial?._id || "";

      if (materialId && Number(movementForm.quantity) > 0) {
        await addRawMaterialMovement({
          rawMaterialId: materialId,
          movementType: movementForm.movementType,
          quantity: Number(movementForm.quantity) || 0,
          reason: movementForm.reason.trim(),
          notes: movementForm.notes.trim(),
          businessId: user?.businessId,
          branchId: user?.branchId,
          createdBy: user?.id || user?._id || "system",
        });
      }

      await logActivity({
        type: "stock",
        action: "create",
        status: "success",
        title: `Raw material added: ${materialForm.name}`,
        description: `Created ${materialForm.name} and recorded its initial movement.`,
        referenceId: materialId,
        entityType: "other",
        entityId: materialId,
        metadata: {
          materialName: materialForm.name,
          movementType: movementForm.movementType,
          quantity: movementForm.quantity,
        },
        businessId: user?.businessId,
        createdBy: user?.id || user?._id || "",
      });

      notifyResourceCreated("Raw material", materialForm.name);
      notifySuccess(
        "Raw Material Added",
        `${materialForm.name} is now available.`,
      );
      setMaterialForm({ ...emptyMaterialForm });
      setMovementForm({ ...emptyMovementForm });
      setShowAddDialog(false);
    } catch (error: unknown) {
      notifyError(
        "Unable to save raw material.",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  const handleProductionSubmit = async () => {
    if (!productionForm.productId) {
      notifyError(
        "Select a product",
        "Choose a finished product for today's production.",
      );
      return;
    }

    if (producedQuantity <= 0) {
      notifyError(
        "Invalid production",
        "Produced quantity must be greater than zero after computing opening, closing, sales, and damaged stock.",
      );
      return;
    }

    const bulkUnitLabel = productionForm.bulkUnitKey.trim()
      ? `${productionForm.bulkUnitKey.trim()}: ${productionForm.bulkUnitValue.trim()}`
      : productionForm.bulkUnitValue.trim();

    const tracePayload = {
      productId: productionForm.productId,
      productionDate: productionForm.date,
      quantity: producedQuantity,
      bulkUnitKey: productionForm.bulkUnitKey,
      bulkUnitValue: productionForm.bulkUnitValue,
      bulkUnitLabel: bulkUnitLabel,
      openingStock: productionForm.openingStock,
      closingStock: productionForm.closingStock,
      damagedQuantity: productionForm.damagedQuantity,
      sales: productionForm.sales,
      notes: productionForm.notes,
      components: bomUsage.map((usage) => ({
        componentId: usage.rawMaterialId,
        requiredQuantity: usage.quantity,
        unit: usage.unit,
      })),
    };

    try {
      const createdTrace = await traceProduction(tracePayload);

      const newEntry: ProductionHistoryEntry = {
        id: createdTrace.id || `${Date.now()}-${productionForm.productId}`,
        productId: createdTrace.productId,
        productName: selectedProduct?.name || "Unknown product",
        quantity: createdTrace.quantity,
        bulkUnitLabel: createdTrace.bulkUnitLabel,
        openingStock: createdTrace.openingStock,
        closingStock: createdTrace.closingStock,
        damagedQuantity: createdTrace.damagedQuantity || 0,
        sales: createdTrace.sales,
        date: createdTrace.productionDate,
        notes: createdTrace.notes || "",
      };

      setProductionHistory([newEntry, ...productionHistory]);
      setProductionForm({ ...emptyProductionForm, date: productionForm.date });
      notifySuccess(
        "Production recorded",
        "Daily production has been added to history.",
      );
    } catch (error: unknown) {
      notifyError(
        "Unable to record production.",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  const handleOpenMovementDialog = (
    material: RawMaterial,
    movementType: RawMaterialMovement["movementType"],
  ) => {
    setMovementTarget(material);
    setMovementForm({
      ...emptyMovementForm,
      movementType,
      reason:
        movementType === "received"
          ? "Purchase"
          : movementType === "used"
            ? "Used in production"
            : "Adjusted",
    });
    setShowMovementDialog(true);
  };

  const handleSaveMaterialMovement = async () => {
    if (!movementTarget) return;

    try {
      await addRawMaterialMovement({
        rawMaterialId: movementTarget.id || movementTarget._id || "",
        movementType: movementForm.movementType,
        quantity: Number(movementForm.quantity) || 0,
        reason: movementForm.reason.trim(),
        notes: movementForm.notes.trim(),
        businessId: user?.businessId,
        branchId: user?.branchId,
        createdBy: user?.id || user?._id || "system",
      });

      notifySuccess(
        "Movement recorded",
        `${movementForm.quantity} ${movementTarget.unitOfMeasure || "units"} ${movementForm.movementType} for ${movementTarget.name}.`,
      );
      setShowMovementDialog(false);
      setMovementTarget(null);
    } catch (error: unknown) {
      notifyError(
        "Unable to save movement.",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  const handleDeleteHistory = (entryId: string) => {
    setProductionHistory(
      productionHistory.filter((entry) => entry.id !== entryId),
    );
    notifySuccess(
      "Production deleted",
      "The production history entry has been removed.",
    );
  };

  const handleOpenHistoryDialog = (entry: ProductionHistoryEntry) => {
    setSelectedHistory(entry);
    setShowHistoryDialog(true);
  };

  const handleSaveHistory = () => {
    if (!selectedHistory) return;
    setProductionHistory(
      productionHistory.map((entry) =>
        entry.id === selectedHistory.id ? selectedHistory : entry,
      ),
    );
    setShowHistoryDialog(false);
    notifySuccess(
      "Production updated",
      "Production history entry was updated.",
    );
  };

  const progressPercent = (material: RawMaterial, summaryCurrent: number) => {
    const maxValue =
      Number(material.totalEquivalentQuantity ?? 0) ||
      Number(material.openingBalance ?? 0) ||
      Math.max(summaryCurrent, 1);
    if (maxValue <= 0) return 0;
    return Math.max(0, Math.min(100, (summaryCurrent / maxValue) * 100));
  };

  return (
    <div className="space-y-8">
      <div className="bg-linear-to-r from-slate-900 to-slate-700 rounded-xl p-8 text-white shadow-lg">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <Layers className="w-9 h-9 text-white" />
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                  Inventory & Production
                </p>
                <h1 className="text-4xl font-bold">Raw Material Dashboard</h1>
              </div>
            </div>
            <p className="max-w-2xl text-slate-200 text-lg leading-8">
              Manage raw materials, track production usage, and record daily
              production from one central view.
            </p>
          </div>

          {((user && user.role === "manager") || user?.role === "admin") && (
            <Button
              onClick={() => {
                setMaterialForm({ ...emptyMaterialForm });
                setMovementForm({ ...emptyMovementForm });
                setShowAddDialog(true);
              }}
              className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100"
            >
              <Plus className="w-4 h-4" />
              Add Raw Material
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-teal-200 dark:border-teal-700">
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {totalBalance}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total raw material balance across all materials.
            </p>
          </CardContent>
        </Card>
        <Card className="border-teal-200 dark:border-teal-700">
          <CardHeader>
            <CardTitle>Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {totalReceived}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Received quantity from all materials.
            </p>
          </CardContent>
        </Card>
        <Card className="border-teal-200 dark:border-teal-700">
          <CardHeader>
            <CardTitle>Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {totalUsed}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Quantity used for production and adjustments.
            </p>
          </CardContent>
        </Card>
        <Card className="border-teal-200 dark:border-teal-700">
          <CardHeader>
            <CardTitle>Wasted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {totalWasted}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total damaged or scrapped raw material quantity.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Record Today�s Production</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Product
                  </label>
                  <select
                    value={productionForm.productId}
                    onChange={(event) =>
                      setProductionForm({
                        ...productionForm,
                        productId: event.target.value,
                      })
                    }
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50"
                  >
                    <option value="">Select manufactured product</option>
                    {safeProducts.map((product) => (
                      <option
                        key={product.id || product._id}
                        value={product.id || product._id}
                      >
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Production Date
                  </label>
                  <Input
                    type="date"
                    value={productionForm.date}
                    onChange={(event) =>
                      setProductionForm({
                        ...productionForm,
                        date: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Bulk Unit Key
                  </label>
                  <Input
                    type="text"
                    value={productionForm.bulkUnitKey}
                    onChange={(event) =>
                      setProductionForm({
                        ...productionForm,
                        bulkUnitKey: event.target.value,
                      })
                    }
                    placeholder="e.g. 5, 10"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Bulk Unit Value
                  </label>
                  <Input
                    type="text"
                    value={productionForm.bulkUnitValue}
                    onChange={(event) =>
                      setProductionForm({
                        ...productionForm,
                        bulkUnitValue: event.target.value,
                      })
                    }
                    placeholder="e.g. tanks, drums"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter the bulk unit type used for this production record.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Opening Stock
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={productionForm.openingStock}
                    onChange={(event) =>
                      setProductionForm({
                        ...productionForm,
                        openingStock: Number(event.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Closing Stock
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={productionForm.closingStock}
                    onChange={(event) =>
                      setProductionForm({
                        ...productionForm,
                        closingStock: Number(event.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Sales
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={productionForm.sales}
                    onChange={(event) =>
                      setProductionForm({
                        ...productionForm,
                        sales: Number(event.target.value),
                      })
                    }
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Notes
                  </label>
                  <Textarea
                    value={productionForm.notes}
                    onChange={(event) =>
                      setProductionForm({
                        ...productionForm,
                        notes: event.target.value,
                      })
                    }
                    className="min-h-30"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleProductionSubmit}>
                  Record Production
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Raw Material Usage</CardTitle>
            </CardHeader>
            <CardContent>
              {bomUsage.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Select a manufactured product to view expected raw material
                  usage.
                </p>
              ) : (
                <div className="space-y-3">
                  {bomUsage.map((usage) => (
                    <div
                      key={usage.rawMaterialId}
                      className="grid grid-cols-[1fr_100px_80px] gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {usage.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {usage.unit}
                        </p>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Qty
                      </div>
                      <div className="text-right font-semibold text-slate-900 dark:text-white">
                        {usage.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Production Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Product
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedProduct?.name || "Select a product"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedProduct?.productStage || ""}
                </p>
              </div>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <span className="text-sm text-slate-500">Today produced</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {todayProductionTotal}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <span className="text-sm text-slate-500">Damaged today</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {todayDamagesTotal}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <span className="text-sm text-slate-500">Material usage</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {todayRawMaterialsUsedTotal}
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-500">BOM details</p>
                {selectedProduct?.bom?.length ? (
                  <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    {selectedProduct.bom.map((component, index) => (
                      <li key={`${component.componentId}-${index}`}>
                        {component.quantity} {component.unit || "units"} -{" "}
                        {safeProducts.find(
                          (product) =>
                            product._id === component.componentId ||
                            product.id === component.componentId,
                        )?.name || "Unknown"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">
                    No BOM available for this product.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Production KPIs</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-500">Today�s production</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {todayProductionTotal}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-500">Total damages</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {todayDamagesTotal}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-500">Raw materials used</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {todayRawMaterialsUsedTotal}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Production History</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {productionHistory.length === 0 ? (
            <p className="text-sm text-slate-500">
              No production records have been created yet.
            </p>
          ) : (
            <table className="min-w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Quantity</th>
                  <th className="px-3 py-3 font-medium">Damaged</th>
                  <th className="px-3 py-3 font-medium">Sales</th>
                  <th className="px-3 py-3 font-medium">Notes</th>
                  <th className="px-3 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productionHistory.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-slate-200 dark:border-slate-700"
                  >
                    <td className="px-3 py-3">{entry.date}</td>
                    <td className="px-3 py-3">{entry.productName}</td>
                    <td className="px-3 py-3">{entry.quantity}</td>
                    <td className="px-3 py-3">{entry.damagedQuantity}</td>
                    <td className="px-3 py-3">{entry.notes || "�"}</td>
                    <td className="px-3 py-3 space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenHistoryDialog(entry)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenHistoryDialog(entry)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteHistory(entry.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Raw Material Inventory</h2>
          <p className="text-sm text-slate-500">
            Manage stock levels and view remaining balances.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {materialSummaries.map(({ material, summary }) => {
            const materialId = material._id || material.id || "";
            const percent = progressPercent(material, summary.currentBalance);
            return (
              <div
                key={materialId}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {material.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {material.category || "Uncategorized"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold text-slate-900 dark:text-white">
                      {summary.currentBalance}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {material.unitOfMeasure || "units"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Remaining</span>
                    <span>{Math.round(percent)}%</span>
                  </div>
                  <Progress value={percent} className="h-2 rounded-full" />
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Reorder level</span>
                    <span>{material.reorderLevel ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Used</span>
                    <span>{summary.totalUsed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Wasted</span>
                    <span>{summary.totalWasted}</span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleOpenMovementDialog(material, "received")
                    }
                  >
                    <ArrowUpRight className="w-3 h-3" /> Stock In
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenMovementDialog(material, "used")}
                  >
                    <ArrowDownRight className="w-3 h-3" /> Stock Out
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowMaterialDetails(material)}
                  >
                    <Eye className="w-3 h-3" /> View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      notifyError(
                        "Edit not implemented",
                        "Raw material editing will be added in a later step.",
                      )
                    }
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      notifyError(
                        "Delete not implemented",
                        "Raw material deletion is not wired yet.",
                      )
                    }
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
        <DialogContent className="max-w-xl rounded-3xl p-6 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>Stock Movement</DialogTitle>
            <DialogDescription>
              Record a stock movement for the selected raw material.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {movementTarget?.name}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Movement Type
                </label>
                <select
                  value={movementForm.movementType}
                  onChange={(event) =>
                    setMovementForm({
                      ...movementForm,
                      movementType: event.target
                        .value as RawMaterialMovement["movementType"],
                    })
                  }
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50"
                >
                  <option value="received">Received</option>
                  <option value="used">Used</option>
                  <option value="wasted">Wasted</option>
                  <option value="adjusted">Adjusted</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Quantity
                </label>
                <Input
                  type="number"
                  min={0}
                  value={movementForm.quantity}
                  onChange={(event) =>
                    setMovementForm({
                      ...movementForm,
                      quantity: event.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Reason
              </label>
              <Input
                value={movementForm.reason}
                onChange={(event) =>
                  setMovementForm({
                    ...movementForm,
                    reason: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Notes
              </label>
              <Textarea
                value={movementForm.notes}
                onChange={(event) =>
                  setMovementForm({
                    ...movementForm,
                    notes: event.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowMovementDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveMaterialMovement}>
                Save Movement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(showMaterialDetails)}
        onOpenChange={() => setShowMaterialDetails(null)}
      >
        <DialogContent className="max-w-2xl rounded-3xl p-6 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>Raw Material Details</DialogTitle>
          </DialogHeader>
          {showMaterialDetails && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {showMaterialDetails.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Category</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {showMaterialDetails.category || "-"}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Current Balance</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {showMaterialDetails.currentStockBalance ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Reorder Level</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {showMaterialDetails.reorderLevel ?? 0}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Description</p>
                <p className="text-base text-slate-700 dark:text-slate-300">
                  {showMaterialDetails.description ||
                    "No description provided."}
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setShowMaterialDetails(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl h-175 overflow-auto rounded-3xl p-6 dark:bg-slate-700">
          <DialogHeader>
            <DialogTitle>Add Raw Material</DialogTitle>
            <DialogDescription>
              Create a raw material record and optionally record an opening
              stock movement.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMaterial} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Name *
                </label>
                <Input
                  value={materialForm.name}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      name: event.target.value,
                    })
                  }
                  placeholder="e.g. Steel coil"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Code
                </label>
                <Input
                  value={materialForm.code}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      code: event.target.value,
                    })
                  }
                  placeholder="STL-001"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Category
                </label>
                <select
                  value={materialForm.category}
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      category: event.target.value,
                    })
                  }
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50"
                >
                  <option value="">Select category</option>
                  <option value="mixing">Mixing</option>
                  <option value="packaging">Packaging</option>
                  <option value="labeling">Labeling</option>
                  <option value="assembly">Assembly</option>
                  <option value="storage">Storage</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Description
                </label>
                <Textarea
                  value={materialForm.description}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="Add notes about this raw material"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Unit of Measure
                </label>
                <Input
                  value={materialForm.unitOfMeasure}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      unitOfMeasure: event.target.value,
                    })
                  }
                  placeholder="kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Packaging Unit
                </label>
                <Input
                  value={materialForm.packagingUnit}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      packagingUnit: event.target.value,
                    })
                  }
                  placeholder="Box, Bale, Roll"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Quantity per Pack
                </label>
                <Input
                  type="number"
                  value={materialForm.quantityPerPack}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      quantityPerPack: event.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Sub-unit Size
                </label>
                <Input
                  type="number"
                  value={materialForm.subUnitSize}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      subUnitSize: event.target.value,
                    })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Total Equivalent Quantity
                </label>
                <Input
                  type="number"
                  value={materialForm.totalEquivalentQuantity}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      totalEquivalentQuantity: event.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Opening Balance
                </label>
                <Input
                  type="number"
                  value={materialForm.openingBalance}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      openingBalance: event.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Current Stock Balance
                </label>
                <Input
                  type="number"
                  value={materialForm.currentStockBalance}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      currentStockBalance: event.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Quantity Received
                </label>
                <Input
                  type="number"
                  value={materialForm.quantityReceived}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      quantityReceived: event.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Quantity Used
                </label>
                <Input
                  type="number"
                  value={materialForm.quantityUsed}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      quantityUsed: event.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Quantity Wasted
                </label>
                <Input
                  type="number"
                  value={materialForm.quantityWasted}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      quantityWasted: event.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Reorder Level
                </label>
                <Input
                  type="number"
                  value={materialForm.reorderLevel}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      reorderLevel: event.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Minimum Stock Level
                </label>
                <Input
                  type="number"
                  value={materialForm.minimumStockLevel}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      minimumStockLevel: event.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Maximum Stock Level
                </label>
                <Input
                  type="number"
                  value={materialForm.maximumStockLevel}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      maximumStockLevel: event.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Supplier
                </label>
                <Input
                  value={materialForm.supplier}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      supplier: event.target.value,
                    })
                  }
                  placeholder="Supplier name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Purchase Price
                </label>
                <Input
                  type="number"
                  value={materialForm.purchasePrice}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      purchasePrice: event.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Currency
                </label>
                <Input
                  value={materialForm.currency}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      currency: event.target.value,
                    })
                  }
                  placeholder="USD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Storage Location
                </label>
                <Input
                  value={materialForm.storageLocation}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      storageLocation: event.target.value,
                    })
                  }
                  placeholder="Warehouse A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Storage Condition
                </label>
                <Input
                  value={materialForm.storageCondition}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      storageCondition: event.target.value,
                    })
                  }
                  placeholder="Cool, dry place"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Expiry Date
                </label>
                <Input
                  type="date"
                  value={materialForm.expiryDate}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMaterialForm({
                      ...materialForm,
                      expiryDate: event.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Handling Notes
              </label>
              <Textarea
                value={materialForm.handlingNotes}
                className="dark:bg-slate-900 border-none dark:text-white"
                onChange={(event) =>
                  setMaterialForm({
                    ...materialForm,
                    handlingNotes: event.target.value,
                  })
                }
                placeholder="Storage or handling instructions"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Movement Type
                </label>
                <select
                  value={movementForm.movementType}
                  onChange={(event) =>
                    setMovementForm({
                      ...movementForm,
                      movementType: event.target
                        .value as RawMaterialMovement["movementType"],
                    })
                  }
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50"
                >
                  <option value="received">Received</option>
                  <option value="used">Used</option>
                  <option value="wasted">Wasted</option>
                  <option value="adjusted">Adjusted</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Quantity
                </label>
                <Input
                  type="number"
                  value={movementForm.quantity}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMovementForm({
                      ...movementForm,
                      quantity: event.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Reason
                </label>
                <Input
                  value={movementForm.reason}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMovementForm({
                      ...movementForm,
                      reason: event.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Notes
                </label>
                <Input
                  value={movementForm.notes}
                  className="dark:bg-slate-900 border-none dark:text-white"
                  onChange={(event) =>
                    setMovementForm({
                      ...movementForm,
                      notes: event.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Raw Material</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl rounded-3xl p-6 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>Edit Production Entry</DialogTitle>
          </DialogHeader>
          {selectedHistory && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-200">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    value={selectedHistory.quantity}
                    onChange={(event) =>
                      setSelectedHistory({
                        ...selectedHistory,
                        quantity: Number(event.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200">
                    Damaged
                  </label>
                  <Input
                    type="number"
                    value={selectedHistory.damagedQuantity}
                    onChange={(event) =>
                      setSelectedHistory({
                        ...selectedHistory,
                        damagedQuantity: Number(event.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200">
                  Notes
                </label>
                <Textarea
                  value={selectedHistory.notes}
                  onChange={(event) =>
                    setSelectedHistory({
                      ...selectedHistory,
                      notes: event.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button
                  variant="outline"
                  onClick={() => setShowHistoryDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveHistory}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
