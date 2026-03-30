"use client";

import { useState } from "react";
import { Product, Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreVertical, Edit2, Trash2, Mail, Phone, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SupplierTableProps {
  suppliers: Supplier[];
  products: Product[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  searchTerm?: string;
}

export function SupplierTable({
  suppliers,
  products,
  onEdit,
  onDelete,
  searchTerm = "",
}: SupplierTableProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

  let filtered = suppliers || [];

  if (searchTerm) {
    const normalized = searchTerm.toLowerCase();
    filtered =
      filtered.filter((s: any) => {
        const productNames = Array.isArray(s.products)
          ? s.products.join(" ").toLowerCase()
          : "";

        return (
          s.name.toLowerCase().includes(normalized) ||
          s.email.toLowerCase().includes(normalized) ||
          s?.city?.toLowerCase().includes(normalized) ||
          s?.country?.toLowerCase().includes(normalized) ||
          s.phone.toLowerCase().includes(normalized) ||
          productNames.includes(normalized)
        );
      }) || [];
  }

  const { user } = useAuth();

  const getAssignedProductNames = (supplier: Supplier) => {
    const supplierProds =
      supplier.products?.map(
        (prodId: any) =>
          products.find((p) => p._id === prodId?._id) || "Unknown",
      ) || [];
    return supplierProds;
  };

  return (
    <Card className="border-green-200 h-screen dark:border-teal-700 border-2 mt-6 bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="dark:text-teal-100">
          Suppliers ({filtered.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filtered?.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 text-center py-8">
            No suppliers found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-200 dark:border-teal-700 bg-green-50 dark:bg-slate-700">
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-slate-300">
                    Name
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-slate-300">
                    Email
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-slate-300">
                    Phone
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-slate-300">
                    Location
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-slate-300">
                    Products ({products.length})
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-slate-300">
                    Payment Terms
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-slate-300">
                    Status
                  </th>
                  <th className="text-center p-3 font-semibold text-gray-700 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered?.map((supplier, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <td className="p-3 font-medium text-gray-900 dark:text-teal-100">
                      {supplier.name}
                    </td>
                    <td className="p-3">
                      <a
                        href={`mailto:${supplier.email}`}
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <Mail className="w-3 h-3" />
                        {supplier.email}
                      </a>
                    </td>
                    <td className="p-3">
                      <a
                        href={`tel:${supplier.phone}`}
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <Phone className="w-3 h-3" />
                        {supplier.phone}
                      </a>
                    </td>
                    <td className="p-3 text-gray-600 dark:text-slate-400">
                      {supplier.city}, {supplier.country}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-slate-400">
                      {(() => {
                        const assignedProducts =
                          getAssignedProductNames(supplier);
                        return assignedProducts.length > 0 ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="p-1">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              side="bottom"
                              className="w-56 max-h-60 overflow-y-auto"
                            >
                              {assignedProducts.map(
                                (prod: any, idx: number) => (
                                  <DropdownMenuItem
                                    key={`${supplier._id}-${idx}`}
                                  >
                                    {prod?.name || "Unknown Product"}(
                                    {products.length} {prod?.unit})
                                  </DropdownMenuItem>
                                ),
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-gray-400">No products</span>
                        );
                      })()}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-slate-400">
                      {supplier.paymentTerms}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-slate-400">
                      {supplier.status}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setDetailsOpen(true);
                          }}
                          className="text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(supplier)}
                          className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {(user?.role === "admin" ||
                          user?.role === "manager") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onDelete(supplier?.id || supplier?._id || "")
                            }
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <Dialog
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) setSelectedSupplier(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
            <DialogDescription>
              View full supplier information and assigned products.
            </DialogDescription>
          </DialogHeader>

          {selectedSupplier ? (
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {selectedSupplier.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedSupplier.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedSupplier.phone}
              </p>
              <p>
                <strong>Location:</strong> {selectedSupplier.city},{" "}
                {selectedSupplier.country}
              </p>
              <p>
                <strong>Payment Terms:</strong> {selectedSupplier.paymentTerms}
              </p>
              <p>
                <strong>Status:</strong> {selectedSupplier.status}
              </p>
              <p>
                <strong>Products:</strong>
              </p>
              <ul className="list-disc list-inside">
                {getAssignedProductNames(selectedSupplier).map((name, idx) => (
                  <li
                    key={`${selectedSupplier.id || selectedSupplier._id}-${idx}`}
                  >
                    {name}
                  </li>
                ))}
              </ul>
              {selectedSupplier.notes && (
                <p>
                  <strong>Notes:</strong> {selectedSupplier.notes}
                </p>
              )}
            </div>
          ) : (
            <p>No supplier selected.</p>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
