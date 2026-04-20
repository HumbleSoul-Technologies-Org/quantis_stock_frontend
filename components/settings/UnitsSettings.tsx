"use client";

import { AppSettings } from "@/lib/types";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBusinessConfig } from "@/hooks/useBusinessConfig";
import { Loader, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";

interface UnitsSettingsProps {
  settings: AppSettings;
  onUpdate: (settings: Partial<AppSettings>) => void;
}

export function UnitsSettings({ settings, onUpdate }: UnitsSettingsProps) {
  const { config: businessConfig } = useBusinessConfig();
  const [inputValue, setInputValue] = useState("");
  const [saved, setSaved] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const { user, business } = useAuth();

  // Track custom units and deleted defaults
  const customUnits = settings.units?.customUnits || [];
  const deletedDefaults = settings.units?.deletedDefaults || [];

  // Unit categories as default units
  const weightUnits = ["kg", "lbs", "oz", "g"];
  const volumeUnits = ["L", "ml", "gallons", "fl oz"];
  const lengthUnits = ["m", "cm", "mm", "inches", "feet", "km", "yards"];
  const countUnits = [
    "units",
    "pieces",
    "boxes",
    "cases",
    "packs",
    "cartons",
    "bottles",
    "tablets",
    "capsules",
  ];

  // All default units combined
  const allDefaultUnits = [
    ...weightUnits,
    ...volumeUnits,
    ...lengthUnits,
    ...countUnits,
  ];

  // Get all default units, excluding deleted ones
  const defaultUnits = allDefaultUnits.filter(
    (u) => !deletedDefaults.includes(u),
  );

  // Combine default and custom units
  const allUnits = [...defaultUnits, ...customUnits];

  const handleAddUnits = async () => {
    try {
      setProcessing(true);
      if (!inputValue.trim()) {
        setError("Please enter at least one unit");
        return;
      }

      // Parse comma-separated input
      const newUnits = inputValue
        .split(",")
        .map((u) => u.trim())
        .filter((u) => u.length > 0);

      // Check for duplicates
      const duplicates = newUnits.filter((u) => allUnits.includes(u));
      if (duplicates.length > 0) {
        setError(`Already exists: ${duplicates.join(", ")}`);
        return;
      }

      // Add new units to custom units
      const updatedCustomUnits = [...customUnits, ...newUnits];
      const payLoad = {
        defaultUnits,
      };
      await apiRequest(
        "PUT",
        `/settings/units/${business?._id}`,
        allDefaultUnits,
        user?.token,
      );
      // // Update settings
      // onUpdate({
      //   units: {
      //     ...settings.units,
      //     customUnits: updatedCustomUnits,
      //   },
      // });
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    } finally {
      setProcessing(false);
      setInputValue("");
      setError("");
    }
  };

  const handleDeleteUnit = (unit: string) => {
    const isDefault = defaultUnits.includes(unit);

    if (isDefault) {
      // Track as deleted default
      const updatedDeletedDefaults = [...deletedDefaults, unit];
      onUpdate({
        units: {
          ...settings.units,
          deletedDefaults: updatedDeletedDefaults,
        },
      });
    } else {
      // Remove from custom units
      const updatedCustomUnits = customUnits.filter((u) => u !== unit);
      onUpdate({
        units: {
          ...settings.units,
          customUnits: updatedCustomUnits,
        },
      });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Categorize all units
  const categorizedWeight = allUnits.filter((u) => weightUnits.includes(u));
  const categorizedVolume = allUnits.filter((u) => volumeUnits.includes(u));
  const categorizedLength = allUnits.filter((u) => lengthUnits.includes(u));
  const categorizedCount = allUnits.filter((u) => countUnits.includes(u));

  const UnitCategory = ({
    title,
    units,
  }: {
    title: string;
    units: string[];
  }) => {
    if (units.length === 0) return null;
    return (
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
          {title}
        </h4>
        <div className="flex flex-wrap gap-2">
          {units.map((unit) => (
            <div
              key={unit}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-teal-900/30 text-green-900 dark:text-teal-100 rounded-full text-sm border border-green-300 dark:border-teal-700"
            >
              <span>{unit}</span>
              <button
                onClick={() => handleDeleteUnit(unit)}
                className="ml-1 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete unit"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
      <CardHeader>
        <CardTitle className="dark:text-teal-100">Measurement Units</CardTitle>
        <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
          Add custom units or manage existing ones
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Add a new unit
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError("");
              }}
              placeholder="e.g., km or km, yards, inches"
              className="flex-1 px-3 py-2 border border-green-200 dark:border-teal-700 rounded-md text-sm bg-white dark:bg-slate-700 dark:text-slate-50 placeholder-gray-400 dark:placeholder-slate-400"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Enter a single unit or comma-separated units
          </p>
        </div>

        {/* Add Button */}
        <Button
          onClick={handleAddUnits}
          className="bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700"
        >
          {processing ? (
            <>
              Adding... <Loader className="animate-spin" />
            </>
          ) : (
            "Add Units"
          )}
        </Button>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm">❌ {error}</p>
        )}

        {/* Success Message */}
        {saved && (
          <p className="text-green-600 dark:text-green-400 text-sm">
            ✓ Units updated successfully
          </p>
        )}

        {/* Units Display */}
        {allUnits.length > 0 && (
          <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-teal-700 space-y-4">
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Available Units ({allUnits.length})
            </p>
            <UnitCategory title="Weight Units" units={categorizedWeight} />
            <UnitCategory title="Volume Units" units={categorizedVolume} />
            <UnitCategory title="Length Units" units={categorizedLength} />
            <UnitCategory title="Count Units" units={categorizedCount} />
          </div>
        )}

        {/* No Units Message */}
        {allUnits.length === 0 && (
          <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-teal-700">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              No units available. Add one to get started!
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            <strong>Tip:</strong> You can delete any unit by clicking the X
            button. Changes are saved automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
