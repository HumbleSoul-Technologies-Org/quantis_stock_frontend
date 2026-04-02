"use client";

import { useState, useContext } from "react";
import { Sale, SaleItem, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Trash2 } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { ThemeContext } from "@/components/theme-provider";
import { v4 as uuidv4 } from "uuid";
import { apiRequest } from "@/lib/queryClient";
import { set } from "date-fns";
import Select from "react-select";

interface SalesFormProps {
  products: Product[];
  onSubmit: (sale: Sale) => void;
  onCancel: () => void;
  currentUserId: string;
  currentUsername: string;
}

export function SalesForm({
  products,
  onSubmit,
  onCancel,
  currentUserId,
  currentUsername,
}: SalesFormProps) {
  const { formatCurrency } = useSettings();
  const { user } = useAuth();
  const { theme } = useContext(ThemeContext) || { theme: "light" };

  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentType, setPaymentType] = useState("cash");
  const [txnId, setTxnId] = useState("");
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productOptions = products
    .filter((p) => p.currentStock > 0)
    .map((p) => ({
      value: p._id || p.id,
      label: `${p.name} (${p.currentStock} available)`,
    }));

  const addItem = () => {
    if (!selectedProductId || !quantity) {
      setErrors({ product: "Select product and quantity" });
      return;
    }

    const product = products.find(
      (p) => p.id === selectedProductId || p._id === selectedProductId,
    );
    if (!product) return;

    if (parseInt(quantity) > product.currentStock) {
      setErrors({ quantity: `Only ${product.currentStock} available` });
      return;
    }

    const saleItem: SaleItem = {
      productId: selectedProductId,
      quantity: parseInt(quantity),
      unitPrice: product.unitPrice,
      total: parseInt(quantity) * product.unitPrice,
    };

    setItems([...items, saleItem]);
    setSelectedProductId("");
    setQuantity("");
    setErrors({});
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (items.length === 0)
      newErrors.items = "Add at least one item to the sale";
    if (!customerName.trim())
      newErrors.customerName = "Customer name is required";
    if (paymentType !== "cash" && !txnId.trim())
      newErrors.txnId = "Transaction ID is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const saleNumber = `S-${Date.now()}`;
      const payLoad = {
        saleNumber,
        date: saleDate,
        items,
        totalAmount,
        status: "completed",
        notes,
        createdBy: currentUserId,
        customerName,
        paymentType,
        txnId: uuidv4(),
      };

      const res = await apiRequest("POST", "/sales/new", payLoad, user?.token);

      if (res.ok) {
        const data = await res.json();
        const sale: Sale = {
          id: data._id,
          saleNumber,
          date: saleDate,
          items,
          totalAmount,
          status: "completed",
          notes,
          createdBy: currentUserId,
          createdAt: data.sale.createdAt,
          customerName,
          paymentType,
          txnId: data.sale.txnId,
        };
        onSubmit(sale);
        setItems([]);
        setCustomerName("");
        setPaymentType("cash");
        setTxnId("");
        setSaleDate(new Date().toISOString().split("T")[0]);
        setNotes("");
        setErrors({});
      }
    } catch (error) {
      console.error("Failed to complete sale:", error);
      setErrors({ general: "Failed to complete sale. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <X className="w-4 h-4 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Customer Name *
          </label>
          <Input
            disabled={user?.role === "accountant"}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
            className={
              errors.customerName
                ? "border-red-500"
                : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
            }
          />
          {errors.customerName && (
            <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Date of Sale *
          </label>
          <Input
            disabled={user?.role === "accountant"}
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Payment Type *
          </label>
          <select
            disabled={user?.role === "accountant"}
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="w-full px-3 py-2 border border-green-200 dark:border-teal-700 rounded-md text-sm bg-white dark:bg-slate-700 dark:text-slate-50"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="other">Other</option>
          </select>
        </div>

        {paymentType !== "cash" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Transaction ID *
            </label>
            <Input
              disabled={user?.role === "accountant"}
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              placeholder="e.g., TXN-123456"
              className={
                errors.txnId
                  ? "border-red-500"
                  : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
              }
            />
            {errors.txnId && (
              <p className="text-red-500 text-xs mt-1">{errors.txnId}</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
          Add Products
        </label>
        <p className="text-sm text-muted-foreground">
          (Click the "+ Add" button to include the product in the sale)
        </p>
        <div className="flex gap-2">
          <Select
            className="flex-1"
            classNamePrefix="react-select"
            value={productOptions.find(
              (option) => option.value === selectedProductId,
            )}
            onChange={(selectedOption) =>
              setSelectedProductId(selectedOption?.value || "")
            }
            options={productOptions}
            placeholder="Select product"
            isDisabled={user?.role === "accountant"}
            styles={{
              control: (provided, state) => ({
                ...provided,
                border: "1px solid rgb(34 197 94)",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                backgroundColor: theme === "dark" ? "rgb(51 65 85)" : "white",
                color: theme === "dark" ? "rgb(248 250 252)" : "inherit",
                minHeight: "2.5rem",
                "&:hover": {
                  borderColor: "rgb(34 197 94)",
                },
              }),
              singleValue: (provided) => ({
                ...provided,
                color: theme === "dark" ? "rgb(248 250 252)" : "inherit",
              }),
              placeholder: (provided) => ({
                ...provided,
                color: "rgb(107 114 128)",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: theme === "dark" ? "rgb(51 65 85)" : "white",
                border: "1px solid rgb(34 197 94)",
                borderRadius: "0.375rem",
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected
                  ? "rgb(34 197 94)"
                  : state.isFocused
                    ? theme === "dark"
                      ? "rgb(71 85 105)"
                      : "rgb(243 244 246)"
                    : theme === "dark"
                      ? "rgb(51 65 85)"
                      : "white",
                color: state.isSelected
                  ? "white"
                  : theme === "dark"
                    ? "rgb(248 250 252)"
                    : "inherit",
                "&:hover": {
                  backgroundColor:
                    theme === "dark" ? "rgb(71 85 105)" : "rgb(243 244 246)",
                },
              }),
            }}
          />
          <Input
            disabled={user?.role === "accountant"}
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Qty"
            className="w-20 border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
          />
          <Button
            disabled={user?.role === "accountant"}
            type="button"
            onClick={addItem}
            className="bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700 gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
        {errors.product && (
          <p className="text-red-500 text-xs">{errors.product}</p>
        )}
        {errors.quantity && (
          <p className="text-red-500 text-xs">{errors.quantity}</p>
        )}
      </div>

      {items.length > 0 && (
        <Card className="bg-gray-50 dark:bg-slate-700 dark:border-teal-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm dark:text-teal-100">
              Sale Items ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((item, index) => {
              const product = products.find(
                (p) => p.id === item.productId || p._id === item.productId,
              );
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-teal-700"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      {product?.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">
                      {item.quantity} × {formatCurrency(item.unitPrice)} ={" "}
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
            <div className="border-t border-gray-200 dark:border-teal-700 pt-2 mt-2">
              <p className="text-sm font-bold text-gray-900 dark:text-teal-100">
                Total: {formatCurrency(totalAmount)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          Notes (Optional)
        </label>
        <textarea
          disabled={user?.role === "accountant"}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any sale notes..."
          rows={3}
          className="w-full px-3 py-2 border border-green-200 dark:border-teal-700 rounded-md text-sm bg-white dark:bg-slate-700 dark:text-slate-50"
        />
      </div>

      {errors.items && <p className="text-red-500 text-sm">{errors.items}</p>}

      <div className="flex gap-2 pt-4">
        <Button
          disabled={user?.role === "accountant" || isSubmitting}
          type="submit"
          className="bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700"
        >
          {isSubmitting ? "Processing Sale..." : "Complete Sale"}
        </Button>
        <Button
          disabled={user?.role === "accountant"}
          type="button"
          variant="outline"
          onClick={() => {
            setItems([]);
            setCustomerName("");
            setPaymentType("cash");
            setTxnId("");
            setSaleDate(new Date().toISOString().split("T")[0]);
            setNotes("");
            setErrors({});
            onCancel();
          }}
          className="dark:border-teal-700 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
