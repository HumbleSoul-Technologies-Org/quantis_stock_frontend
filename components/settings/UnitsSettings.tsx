'use client';

import { AppSettings } from '@/lib/types';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UnitsSettingsProps {
  settings: AppSettings;
  onUpdate: (settings: Partial<AppSettings>) => void;
}

export function UnitsSettings({ settings, onUpdate }: UnitsSettingsProps) {
  const [formData, setFormData] = useState(settings.units);
  const [saved, setSaved] = useState(false);

  const weightUnits = ['kg', 'lbs', 'oz', 'g'];
  const volumeUnits = ['L', 'ml', 'gallons', 'fl oz'];
  const countUnits = ['units', 'boxes', 'cases', 'packs'];

  const handleSave = () => {
    onUpdate({ units: formData });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Card className="border-green-200 border-2">
      <CardHeader>
        <CardTitle>Measurement Units</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight Unit</label>
          <select
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            className="w-full px-3 py-2 border border-green-200 rounded-md text-sm"
          >
            {weightUnits.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Volume Unit</label>
          <select
            value={formData.volume}
            onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
            className="w-full px-3 py-2 border border-green-200 rounded-md text-sm"
          >
            {volumeUnits.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Count Unit</label>
          <select
            value={formData.count}
            onChange={(e) => setFormData({ ...formData, count: e.target.value })}
            className="w-full px-3 py-2 border border-green-200 rounded-md text-sm"
          >
            {countUnits.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div className="p-3 bg-gray-50 rounded border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Current Units:</p>
          <ul className="text-sm text-gray-900 space-y-1">
            <li>Weight: <strong>{formData.weight}</strong></li>
            <li>Volume: <strong>{formData.volume}</strong></li>
            <li>Count: <strong>{formData.count}</strong></li>
          </ul>
        </div>

        {saved && <p className="text-green-600 text-sm">✓ Unit settings saved successfully</p>}

        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
