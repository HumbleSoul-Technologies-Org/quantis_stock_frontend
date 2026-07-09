"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";

export default function ProductionOrderForm({
  onCreated,
}: {
  onCreated?: (order: any) => void;
}) {
  const { user } = useAuth();
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [products, setProducts] = useState<Array<any>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await apiRequest(
          "GET",
          "/products/all",
          { businessId: user?.businessId },
          user?.token,
        );
        if (mounted && resp.ok) setProducts(resp.data || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.businessId, user?.token]);

  const handleCreate = async () => {
    if (!productId || !quantity) return;
    setIsSubmitting(true);
    try {
      const resp = await apiRequest(
        "POST",
        "/production/new",
        { productId, quantity },
        user?.token,
      );
      if (resp.ok) {
        onCreated?.(resp.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="space-y-2">
        <label className="text-sm">Product</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full px-2 py-2 border rounded"
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p._id || p.id} value={p._id || p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <label className="text-sm">Quantity</label>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />

        <div className="pt-3">
          <Button onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Production Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
