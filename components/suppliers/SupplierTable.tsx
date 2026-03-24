'use client';

import { Supplier } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, Mail, Phone } from 'lucide-react';

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  searchTerm?: string;
}

export function SupplierTable({ suppliers, onEdit, onDelete, searchTerm = '' }: SupplierTableProps) {
  let filtered = suppliers;

  if (searchTerm) {
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return (
    <Card className="border-green-200 border-2 mt-6">
      <CardHeader>
        <CardTitle>Suppliers ({filtered.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No suppliers found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-200 bg-green-50">
                  <th className="text-left p-3 font-semibold text-gray-700">Name</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Email</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Phone</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Location</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Payment Terms</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((supplier) => (
                  <tr key={supplier.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{supplier.name}</td>
                    <td className="p-3">
                      <a href={`mailto:${supplier.email}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                        <Mail className="w-3 h-3" />
                        {supplier.email}
                      </a>
                    </td>
                    <td className="p-3">
                      <a href={`tel:${supplier.phone}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                        <Phone className="w-3 h-3" />
                        {supplier.phone}
                      </a>
                    </td>
                    <td className="p-3 text-gray-600">
                      {supplier.city}, {supplier.country}
                    </td>
                    <td className="p-3 text-gray-600">{supplier.paymentTerms}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(supplier)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(supplier.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
