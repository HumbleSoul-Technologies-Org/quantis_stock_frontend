"use client";

import { AppSettings } from "@/lib/types";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBusinessConfig } from "@/hooks/useBusinessConfig";

interface UnitsSettingsProps {
  settings: AppSettings;
  onUpdate: (settings: Partial<AppSettings>) => void;
}

export function UnitsSettings({ settings, onUpdate }: UnitsSettingsProps) {
  const { config: businessConfig } = useBusinessConfig();
  const [formData, setFormData] = useState(settings.units);
  const [saved, setSaved] = useState(false);

  // All available units from business config
  const availableUnits = businessConfig.units;

  // Categorized units for better UX
  const weightUnits = ["kg", "lbs", "oz", "g"];
  const volumeUnits = ["L", "ml", "gallons", "fl oz"];
  const lengthUnits = ["m", "cm", "mm", "inches", "feet"];
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

  // Filter available units by category
  const selectedWeightUnits = availableUnits.filter((u) =>
    weightUnits.includes(u),
  );
  const selectedVolumeUnits = availableUnits.filter((u) =>
    volumeUnits.includes(u),
  );
  const selectedLengthUnits = availableUnits.filter((u) =>
    lengthUnits.includes(u),
  );
  const selectedCountUnits = availableUnits.filter((u) =>
    countUnits.includes(u),
  );

  // Show length section only if length units are available
  const hasLengthUnits = selectedLengthUnits.length > 0;

  const handleSave = () => {
    onUpdate({ units: formData });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Card className="border-green-200 border-2">
      <CardHeader>
        <CardTitle>Measurement Units</CardTitle>
        <p className="text-xs text-gray-500 mt-2">
          Available units for your {businessConfig.units.length} unit types
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weight Units */}
        {selectedWeightUnits.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight Unit{" "}
              {selectedWeightUnits.length === 1 ? "(Only option)" : ""}
            </label>
            <select
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: e.target.value })
              }
              className="w-full px-3 py-2 border border-green-200 rounded-md text-sm"
            >
              {selectedWeightUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Volume Units */}
        {selectedVolumeUnits.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volume Unit{" "}
              {selectedVolumeUnits.length === 1 ? "(Only option)" : ""}
            </label>
            <select
              value={formData.volume}
              onChange={(e) =>
                setFormData({ ...formData, volume: e.target.value })
              }
              className="w-full px-3 py-2 border border-green-200 rounded-md text-sm"
            >
              {selectedVolumeUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Count Units */}
        {selectedCountUnits.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Count Unit{" "}
              {selectedCountUnits.length === 1 ? "(Only option)" : ""}
            </label>
            <select
              value={formData.count}
              onChange={(e) =>
                setFormData({ ...formData, count: e.target.value })
              }
              className="w-full px-3 py-2 border border-green-200 rounded-md text-sm"
            >
              {selectedCountUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Current Units Summary */}
        <div className="p-3 bg-gray-50 rounded border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Current Unit Selection:</p>
          <ul className="text-sm text-gray-900 space-y-1">
            {selectedWeightUnits.length > 0 && (
              <li>
                Weight: <strong>{formData.weight}</strong>
              </li>
            )}
            {selectedVolumeUnits.length > 0 && (
              <li>
                Volume: <strong>{formData.volume}</strong>
              </li>
            )}
            {selectedCountUnits.length > 0 && (
              <li>
                Count: <strong>{formData.count}</strong>
              </li>
            )}
          </ul>
        </div>

        {/* All Available Units Info */}
        <div className="p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-xs font-medium text-blue-900 mb-2">
            Available Units:
          </p>
          <div className="flex flex-wrap gap-1">
            {availableUnits.map((unit) => (
              <span
                key={unit}
                className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
              >
                {unit}
              </span>
            ))}
          </div>
        </div>

        {saved && (
          <p className="text-green-600 text-sm">
            ✓ Unit settings saved successfully
          </p>
        )}

        <Button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700"
        >
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
