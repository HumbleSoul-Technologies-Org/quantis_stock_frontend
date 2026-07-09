"use client";

import ProductionOrderForm from "@/components/manufacturing/ProductionOrderForm";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";

export default function ProductionPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    try {
      const resp = await apiRequest(
        "GET",
        "/production/all",
        { businessId: user?.businessId },
        user?.token,
      );
      if (resp.ok) setOrders(resp.data || []);
    } catch (err) {
      console.error("Failed to fetch production orders", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.businessId, user?.token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Production Orders</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <ProductionOrderForm
            onCreated={(o) => {
              fetchOrders();
            }}
          />
        </div>
        <div className="md:col-span-2">
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o._id || o.id} className="p-3 border rounded bg-white">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{o._id}</div>
                    <div className="text-sm text-slate-500">
                      Product: {o.productId}
                    </div>
                    <div className="text-sm text-slate-500">
                      Quantity: {o.quantity}
                    </div>
                  </div>
                  <div className="text-sm">{o.status}</div>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-sm text-slate-500">
                No production orders yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
