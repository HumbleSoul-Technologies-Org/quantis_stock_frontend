'use client';

import { AppSettings } from '@/lib/types';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CurrencySettingsProps {
  settings: AppSettings;
  onUpdate: (settings: Partial<AppSettings>) => void;
}

export function CurrencySettings({ settings, onUpdate }: CurrencySettingsProps) {
  const [formData, setFormData] = useState(settings.currency);
  const [saved, setSaved] = useState(false);

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
    { code: 'INR', symbol: '₹' },
    { code: 'CAD', symbol: 'C$' },
    { code: 'AUD', symbol: 'A$' },
  ];

  const handleSave = () => {
    onUpdate({ currency: formData });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Card className="border-green-200 border-2">
      <CardHeader>
        <CardTitle>Currency Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Currency</label>
          <select
            value={formData.code}
            onChange={(e) => {
              const selected = currencies.find((c) => c.code === e.target.value);
              if (selected) {
                setFormData({ ...formData, code: selected.code, symbol: selected.symbol });
              }
            }}
            className="w-full px-3 py-2 border border-green-200 rounded-md text-sm"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
          <Input
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            placeholder="$"
            className="border-green-200"
            maxLength={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Decimal Places</label>
          <select
            value={formData.decimalPlaces}
            onChange={(e) => setFormData({ ...formData, decimalPlaces: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-green-200 rounded-md text-sm"
          >
            <option value={0}>0 (12)</option>
            <option value={1}>1 (12.5)</option>
            <option value={2}>2 (12.50)</option>
            <option value={3}>3 (12.500)</option>
          </select>
        </div>

        <div className="p-3 bg-gray-50 rounded border border-gray-200">
          <p className="text-sm text-gray-600">Preview:</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {formData.symbol}
            {(100).toFixed(formData.decimalPlaces)}
          </p>
        </div>

        {saved && <p className="text-green-600 text-sm">✓ Currency settings saved successfully</p>}

        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
