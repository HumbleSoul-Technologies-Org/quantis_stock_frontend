"use client";

import { useState, useEffect, useContext, useRef } from "react";
import { Sale, SaleItem, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { X, Plus, Trash2, Printer } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { useFormatCurrencyShort } from "@/hooks/useFormatCurrencyShort";
import { ThemeContext } from "@/components/theme-provider";
import { v4 as uuidv4 } from "uuid";
import { set } from "date-fns";
import Select from "react-select";
// import { Printer } from "lucide-react";

interface SalesFormProps {
  products: Product[];
  onSubmit: (sale: Sale) => Promise<void> | void;
  onCancel: () => void;
  currentUserId: string;
  currentUsername: string;
  sale?: Sale; // Optional: if provided, form is in edit mode
  RecieptPreview?: (sale: Sale) => Promise<void> | void; // Optional: list of items already sold (for editing)
}

export function SalesForm({
  products,
  onSubmit,
  onCancel,
  currentUserId,
  currentUsername,
  sale,
  RecieptPreview,
}: SalesFormProps) {
  const { formatCurrency } = useSettings();
  const formatCurrencyShort = useFormatCurrencyShort();
  const { user, business } = useAuth();
  const { theme } = useContext(ThemeContext) || { theme: "light" };

  const isEditing = !!sale; // Determine if we're in edit mode

  const [items, setItems] = useState<SaleItem[]>(
    sale?.items?.map((item) => ({
      ...item,
      offline_product_id: item.offline_product_id || "",
    })) || [],
  );
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [customerName, setCustomerName] = useState(sale?.customerName || "");
  const [paymentType, setPaymentType] = useState(sale?.paymentType || "cash");
  const [txnId, setTxnId] = useState(sale?.txnId || "");
  const [saleDate, setSaleDate] = useState(
    sale?.date || new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState(sale?.notes || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form state when sale prop changes
  useEffect(() => {
    if (sale) {
      setItems(sale.items || []);
      setCustomerName(sale.customerName || "");
      setPaymentType(sale.paymentType || "cash");
      setTxnId(sale.txnId || "");
      setSaleDate(sale.date || new Date().toISOString().split("T")[0]);
      setNotes(sale.notes || "");
      setSelectedProductId("");
      setQuantity("");
      setErrors({});
    }
  }, [sale]);

  const productOptions = products
    ?.filter((p) => {
      const hasStock = p.currentStock > 0;
      if (!hasStock) {
        console.debug("🚫 [SALESFORM] Product filtered (no stock):", {
          id: p.id,
          name: p.name,
          stock: p.currentStock,
        });
      }
      return hasStock;
    })
    .map((p) => ({
      value: p.offline_id || p._id || p.id,
      label: `${p.name} (${p.currentStock} available)`,
    }));

  const addItem = () => {
    console.log(
      "🛒 [SALESFORM] addItem - selectedProductId:",
      selectedProductId,
      "quantity:",
      quantity,
    );
    if (!selectedProductId || !quantity) {
      console.log("⚠️ [SALESFORM] Missing product or quantity");
      setErrors({ product: "Select product and quantity" });
      return;
    }

    console.log(
      "🔍 [SALESFORM] Looking up product, available products:",
      products.length,
    );
    console.log(
      "🔍 [SALESFORM] Searching for product with id/._id matching:",
      selectedProductId,
    );
    let product = products.find(
      (p) =>
        p.id === selectedProductId ||
        p._id === selectedProductId ||
        p.offline_id === selectedProductId,
    );

    // Fallback: if not found by ID, try alternate identifiers
    if (!product) {
      console.warn(
        "⚠️ [SALESFORM] Product not found by ID, trying fallback lookup",
      );
      product = products.find(
        (p) =>
          p.id === selectedProductId ||
          p._id === selectedProductId ||
          p.offline_id === selectedProductId,
      );
    }

    if (!product) {
      console.error(
        "❌ [SALESFORM] Product not found for id:",
        selectedProductId,
      );
      console.log(
        "📋 [SALESFORM] Available product IDs:",
        products.map((p) => ({ id: p.id, _id: (p as any)._id })),
      );
      setErrors({ product: "Product not found. Please select again." });
      return;
    }
    console.log("✓ [SALESFORM] Product found:", {
      id: product.id,
      name: product.name,
      stock: product.currentStock,
    });

    if (parseInt(quantity) > product.currentStock) {
      setErrors({ quantity: `Only ${product.currentStock} available` });
      return;
    }

    const saleItem: SaleItem = {
      productId:
        product.id || product._id || product.offline_id || selectedProductId,
      offline_product_id: product.offline_id || undefined,
      quantity: parseInt(quantity),
      unitPrice: product.unitPrice,
      total: parseInt(quantity) * product.unitPrice,
    };

    const payLoad = {
      quantity: parseInt(quantity),
      unitPrice: product.unitPrice,
      total: parseInt(quantity) * product.unitPrice,
      items: [...items, saleItem],
      createdBy: currentUsername,
      txnId: txnId || uuidv4(),
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
      // If editing, use the existing saleNumber and ID; otherwise generate new ones
      const saleNumber = isEditing ? sale.saleNumber : "";
      const newTxnId = txnId || uuidv4();

      const saleData: Sale = {
        ...(isEditing && { _id: sale._id }),
        offline_id: isEditing ? sale.offline_id : "",
        saleNumber,
        date: saleDate,
        items: items.map((item) => ({
          ...item,
          offline_product_id: item.offline_product_id || "",
        })),
        totalAmount,
        status: "completed",
        notes,
        createdBy: currentUserId,
        customerName,
        paymentType,
        txnId: newTxnId,
        ...(isEditing && { _id: sale._id }), // Preserve _id if editing
      };

      // Submit the sale
      await onSubmit(saleData);

      // Create receipt payload with products data for display
      const receiptPayload = {
        ...saleData,
        products, // Include products so receipt can look up product names
      };

      // Call receipt preview with complete data
      RecieptPreview?.(receiptPayload);

      // Clear form
      setItems([]);
      setCustomerName("");
      setPaymentType("cash");
      setTxnId("");
      setSaleDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setErrors({});
    } catch (error) {
      console.error("Failed to complete sale:", error);
      setErrors({
        general: `Failed to ${isEditing ? "update" : "complete"} sale. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 ">
      {errors.general && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <X className="w-4 h-4 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      {isEditing && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Sale Number:{" "}
            <span className="font-mono font-bold">{sale.saleNumber}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
            Customer Name *
          </label>
          <Input
            disabled={user?.role === "accountant"}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
            className={`border-2 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed ${
              errors.customerName
                ? "border-red-500 dark:border-red-500"
                : "border-teal-200 dark:border-teal-700"
            }`}
          />
          {errors.customerName && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-red-500">
                {errors.customerName}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
            Date of Sale *
          </label>
          <Input
            disabled={user?.role === "accountant"}
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            className="border-2  border-teal-200 dark:border-teal-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
            Payment Type *
          </label>
          <select
            disabled={user?.role === "accountant"}
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="w-full px-4 py-2 border-2  border-teal-200 dark:border-teal-700 rounded-lg tex9-sm bg-white dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Transaction ID *
            </label>
            <Input
              disabled={user?.role === "accountant"}
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              placeholder="e.g., TXN-123456"
              className={`border-2  dark:bg-slate-800 dark:text-slate-100 disabled:opac9ty-50 disabled:cursor-not-allowed ${
                errors.txnId
                  ? "border-red-500 dark:border-red-500"
                  : "border-teal-200 dark:border-teal-700"
              }`}
            />
            {errors.txnId && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-red-500">{errors.txnId}</span>
              </div>
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
            className="flex-1 dark:text-slate-100 dark:bg-slate-900 disabled:cursor-not-allowed"
            classNamePrefix="react-select"
            value={productOptions?.find(
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
                border: state.isFocused
                  ? "2px solid rgb(20 184 166)"
                  : `2px solid ${theme === "dark" ? "rgb(71 85 105)" : "rgb(165 243 252)"}`,

                fontSize: "0.875rem",
                backgroundColor: theme === "dark" ? "rgb(30 41 59)" : "white",
                color: theme === "dark" ? "rgb(226 232 240)" : "inherit",
                minHeight: "2.5rem",
                boxShadow: state.isFocused
                  ? `0 0 0 3px ${theme === "dark" ? "rgba(20, 184, 166, 0.1)" : "rgba(20, 184, 166, 0.1)"}`
                  : "none",
                padding: "0",
                cursor: user?.role === "accountant" ? "not-allowed" : "pointer",
                opacity: user?.role === "accountant" ? 0.5 : 1,
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                "&:hover": {
                  borderColor: state.isFocused
                    ? "rgb(20 184 166)"
                    : `${theme === "dark" ? "rgb(71 85 105)" : "rgb(165 243 252)"}`,
                },
              }),
              input: (provided) => ({
                ...provided,
                color: theme === "dark" ? "rgb(226 232 240)" : "inherit",
                padding: "2px 8px",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: theme === "dark" ? "rgb(226 232 240)" : "inherit",
              }),
              placeholder: (provided) => ({
                ...provided,
                color:
                  theme === "dark" ? "rgb(148 163 184)" : "rgb(107 114 128)",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: theme === "dark" ? "rgb(30 41 59)" : "white",
                border: `2px solid ${theme === "dark" ? "rgb(71 85 105)" : "rgb(165 243 252)"}`,
                borderRadius: "0.5rem",
                marginTop: "0.5rem",
                boxShadow:
                  theme === "dark"
                    ? "0 4px 6px rgba(0, 0, 0, 0.3)"
                    : "0 4px 6px rgba(0, 0, 0, 0.1)",
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected
                  ? "rgb(20 184 166)"
                  : state.isFocused
                    ? theme === "dark"
                      ? "rgb(71 85 105)"
                      : "rgb(240 253 250)"
                    : theme === "dark"
                      ? "rgb(30 41 59)"
                      : "white",
                color: state.isSelected
                  ? "#ffffff"
                  : theme === "dark"
                    ? "rgb(226 232 240)"
                    : "rgb(17 24 39)",
                padding: "10px 12px",
                cursor: "pointer",
                fontWeight: state.isSelected ? "500" : "normal",
                transition: "background-color 0.1s ease, color 0.1s ease",
                "&:active": {
                  backgroundColor: "rgb(13 148 136)",
                },
              }),
              indicatorSeparator: (provided) => ({
                ...provided,
                backgroundColor:
                  theme === "dark" ? "rgb(71 85 105)" : "rgb(229 231 235)",
              }),
              dropdownIndicator: (provided, state) => ({
                ...provided,
                color:
                  theme === "dark" ? "rgb(148 163 184)" : "rgb(107 114 128)",
                transition: "color 0.15s ease",
                "&:hover": {
                  color: "rgb(20 184 166)",
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
            className="w-20 border-2  border-teal-200 dark:border-teal-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button
            disabled={user?.role === "accountant"}
            type="button"
            onClick={addItem}
            className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <Card className="bg-gray-50 dark:bg-slate-800 border-teal-200 dark:border-teal-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-900 dark:text-teal-100">
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
                      {item.quantity} × {formatCurrencyShort(item.unitPrice)} ={" "}
                      {formatCurrencyShort(item.total)}
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
                Total: {formatCurrencyShort(totalAmount)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
          Notes (Optional)
        </label>
        <textarea
          disabled={user?.role === "accountant"}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any sale notes..."
          rows={3}
          className="w-full px-4 py-2 border-2 border-teal-200 dark:border-teal-700 rounded-lg text-sm bg-white dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {errors.items && <p className="text-red-500 text-sm">{errors.items}</p>}

      <div className="flex gap-2 pt-4">
        <Button
          disabled={user?.role === "accountant" || isSubmitting}
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Spinner className="h-4 w-4" />
              {isEditing ? "Updating Sale..." : "Processing Sale..."}
            </>
          ) : isEditing ? (
            "Update Sale"
          ) : (
            "Complete Sale"
          )}
        </Button>
        <Button
          disabled={user?.role === "accountant" || isSubmitting}
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
          className="dark:border-teal-700 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Immediate receipt for printing
export const RecieptPreview = ({ payLoad }: { payLoad?: any }) => {
  const { user, business } = useAuth();
  const { formatCurrency } = useSettings();
  const receiptRef = useRef<HTMLDivElement>(null);

  // Format number with k/M/B suffix and no decimals
  const formatShortNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(0) + "B";
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + "k";
    }
    return Math.round(num).toString();
  };

  // Calculate totals
  const items = payLoad?.items || [];
  const subtotal = items.reduce(
    (sum: number, item: any) => sum + item.total,
    0,
  );
  const taxRate = 0.1; // 10% tax (adjust as needed)
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div
        ref={receiptRef}
        className="receipt-container bg-white dark:bg-white text-black p-4 rounded-lg font-mono max-w-xs mx-auto border border-gray-300 dark:border-gray-300"
        style={{ fontFamily: "monospace" }}
      >
        {/* Header */}
        <div className="receipt-header text-center border-b-2 border-dashed border-black pb-3 mb-3">
          <div className="receipt-title font-bold text-lg">
            {business?.businessName || "BUSINESS NAME"}
          </div>
          <div className="receipt-subtitle text-xs text-gray-700">
            {business?.address || "Address Line 1"}
          </div>
          <div className="receipt-subtitle text-xs text-gray-700">
            {business?.phone || "Phone: XXXX-XXXX-XXXX"}
          </div>
          <div className="receipt-title text-base font-bold mt-2">
            SALES RECEIPT
          </div>
        </div>

        {/* Transaction Details */}
        <div className="space-y-1 text-xs mb-3">
          <p className="receipt-info">
            Date:{" "}
            <b>{new Date(payLoad?.date || new Date()).toLocaleDateString()}</b>
          </p>
          <p className="receipt-info">
            Receipt #: <b>{payLoad?.saleNumber || "---"}</b>
          </p>
          <p className="receipt-info">
            Cashier: <b>{payLoad?.createdBy || user?.username || "---"}</b>
          </p>
          <p className="receipt-info">
            Customer: <b>{payLoad?.customerName || "Walk-in"}</b>
          </p>
        </div>

        {/* Items Table */}
        <table className="items-table w-full mb-3">
          <thead>
            <tr className="border-b-2 border-dashed border-black">
              <th className="text-left text-xs font-bold pb-2">Item</th>
              <th className="qty text-right text-xs font-bold pb-2 w-10">
                Qty
              </th>
              <th className="price text-right text-xs font-bold pb-2 w-16">
                Price
              </th>
              <th className="total text-right text-xs font-bold pb-2 w-16">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item: any, index: number) => {
                const product = payLoad?.products?.find(
                  (p: any) =>
                    p.id === item.productId || p._id === item.productId,
                );
                return (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="text-xs py-1">
                      {product?.name || "Product"}
                    </td>
                    <td className="qty text-right text-xs py-1">
                      {item.quantity}
                    </td>
                    <td className="price text-right text-xs py-1">
                      {formatShortNumber(item.unitPrice)}
                    </td>
                    <td className="total text-right text-xs py-1 font-semibold">
                      {formatShortNumber(item.total)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-xs py-2 text-gray-500"
                >
                  No items
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="totals-section border-t-2 border-b-2 border-dashed border-black py-2 my-3">
          <div className="total-row">
            <span>Subtotal:</span>
            <span className="font-semibold">{formatShortNumber(subtotal)}</span>
          </div>
          <div className="total-row">
            <span>Tax (10%):</span>
            <span className="font-semibold">{formatShortNumber(tax)}</span>
          </div>
          <div className="total-row grand-total border-t border-black pt-2 mt-2">
            <span>TOTAL:</span>
            <span>{formatShortNumber(grandTotal)}</span>
          </div>
        </div>

        {/* Payment Information */}
        <div className="payment-info bg-gray-50 border border-gray-200 p-2 rounded mb-3 text-xs">
          <div className="payment-info-row font-semibold">
            <span>Payment Method:</span>
            <span className="uppercase">
              {payLoad?.paymentType
                ? payLoad.paymentType.charAt(0).toUpperCase() +
                  payLoad.paymentType.slice(1)
                : "Cash"}
            </span>
          </div>
          {payLoad?.paymentType !== "cash" && payLoad?.txnId && (
            <div className="payment-info-row">
              <span>Transaction ID:</span>
              <span className="font-mono">{payLoad.txnId}</span>
            </div>
          )}
          {payLoad?.notes && (
            <div className="mt-2 pt-2 border-t border-gray-300">
              <span className="text-xs text-gray-600">
                Notes: {payLoad.notes}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="receipt-number text-xs text-gray-600 mb-3">
          {payLoad?.txnId || "TXN-" + new Date().getTime()}
        </div>
        <div className="footer-message text-lg font-bold mb-2">THANK YOU!</div>
        <div className="footer-text text-xs text-gray-600">
          Please visit us again 😊
        </div>
      </div>

      {/* Print Button */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          body * {
            visibility: hidden;
          }
          .receipt-container,
          .receipt-container * {
            visibility: visible;
          }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            max-width: 100%;
            margin: 0;
            padding: 10px;
            background: white;
            box-shadow: none;
            border: none;
            border-radius: 0;
            page-break-after: always;
          }
        }
      `}</style>
      <div className="flex gap-2 justify-center no-print">
        <Button
          onClick={handlePrint}
          className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 gap-2"
        >
          <Printer className="w-4 h-4" />
          Print Receipt
        </Button>
      </div>
    </div>
  );
};
