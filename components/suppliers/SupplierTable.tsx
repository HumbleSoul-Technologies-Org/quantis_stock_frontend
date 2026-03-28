"use client";

import { Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, Trash2, Mail, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  searchTerm?: string;
}

export function SupplierTable({
  suppliers,
  onEdit,
  onDelete,
  searchTerm = "",
}: SupplierTableProps) {
  let filtered = suppliers;

  if (searchTerm) {
    filtered =
      filtered.filter(
        (s: any) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s?.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s?.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.products.toLowerCase().includes(searchTerm.toLowerCase()),
      ) || [];
  }

  const { user } = useAuth();

  return (
    <Card className="border-green-200 dark:border-teal-700 border-2 mt-6 bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="dark:text-teal-100">
          Suppliers ({filtered.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
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
                {filtered.map((supplier, index) => (
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
    </Card>
  );
}
