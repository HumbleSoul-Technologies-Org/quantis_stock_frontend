"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Edit2, Loader, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { set } from "date-fns";

export function Profile() {
  const { user, business, updateBusinessSetup, updateBusiness } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [editForm, setEditForm] = useState({
    businessName: business?.businessName || "",
    businessType: business?.businessType || "retail",
    businessEmail: business?.businessEmail?.email || "",
    businessPhone: business?.businessPhone?.contact || "",
    businessAddress: business?.businessAddress || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: usersData } = useQuery<any[]>({
    queryKey: ["users", business?._id || user?.businessId],
    enabled: !!user?.token,
  });

  const handleEditSave = async () => {
    setProcessing(true);
    try {
      const newErrors: Record<string, string> = {};
      if (!editForm.businessName?.trim()) {
        newErrors.businessName = "Business name is required";
      }
      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) {
        // Update business setup with full object
        const payLoad = {
          businessName: editForm.businessName,
          businessType: editForm.businessType,
          businessEmail: {
            email: editForm.businessEmail,
            verified: business?.businessEmail?.verified ?? false,
          },
          businessPhone: {
            contact: editForm.businessPhone,
            verified: business?.businessPhone?.verified ?? false,
          },
          businessAddress: editForm.businessAddress,
        };
        const res = await apiRequest(
          "PUT",
          `/settings/business-profile/${business?._id}`,
          payLoad,
          user?.token,
        );

        // Update local state and storage immediately after successful save
        if (res.ok && business) {
          const updatedBusiness = {
            ...business,
            businessName: editForm.businessName,
            businessType: editForm.businessType,
            businessEmail: {
              email: editForm.businessEmail,
              verified: business?.businessEmail?.verified ?? false,
            },
            businessPhone: {
              contact: editForm.businessPhone,
              verified: business?.businessPhone?.verified ?? false,
            },
            businessAddress: editForm.businessAddress,
          };
          updateBusiness(updatedBusiness);
        }
      }
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    } finally {
      setProcessing(false);
      setIsEditDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-teal-100">
            <Building2 className="w-5 h-5" />
            Business Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Business Name
              </label>
              <p className="text-sm text-gray-900 dark:text-slate-100">
                {business?.businessName || "Not set"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Business Type
              </label>
              <p className="text-sm text-gray-900 dark:text-slate-100">
                {business?.businessType === "retail"
                  ? "Retail - Optimized for retail stores"
                  : "Other"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Business Email
              </label>
              <p className="text-sm text-gray-900 dark:text-slate-100">
                {business?.businessEmail?.email || "Not set"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Business Phone
              </label>
              <p className="text-sm text-gray-900 dark:text-slate-100">
                {business?.businessPhone?.contact || "Not set"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Business Address
              </label>
              <p className="text-sm text-gray-900 dark:text-slate-100">
                {business?.businessAddress || "Not set"}
              </p>
            </div>
          </div>

          {/* Users and Roles */}
          <div className="pt-4 border-t border-gray-200 dark:border-teal-700">
            <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users and Roles
            </h3>
            <div className="space-y-2">
              {usersData?.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700 rounded-md"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      {user.name || user.username}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">
                      {user.email}
                    </p>
                  </div>
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                </div>
              )) || (
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  No users found
                </p>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-teal-700">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Business Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md dark:bg-slate-800">
                <DialogHeader>
                  <DialogTitle>Edit Business Profile</DialogTitle>
                  <DialogDescription>
                    Update your business information.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={editForm.businessName}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          businessName: e.target.value,
                        })
                      }
                      className={`${errors.businessName ? "border-red-500" : ""} w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-900 dark:text-slate-50`}
                    />
                    {errors.businessName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.businessName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="businessType">Business Type</Label>
                    <select
                      disabled={true}
                      id="businessType"
                      value={editForm.businessType}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          businessType: e.target.value as "retail" | "other",
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-900 dark:text-slate-50"
                    >
                      <option value="retail">Retail</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="businessEmail">Business Email</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={editForm.businessEmail}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          businessEmail: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessPhone">Business Phone</Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      inputMode="tel"
                      pattern="[0-9]*"
                      value={editForm.businessPhone || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          businessPhone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Input
                      id="businessAddress"
                      value={editForm.businessAddress}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          businessAddress: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleEditSave} disabled={processing}>
                    {processing ? (
                      <>
                        Saving... <Loader className="animate-spin" />
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
