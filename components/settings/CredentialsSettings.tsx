'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface CredentialsSettingsProps {
  role: string;
}

export function CredentialsSettings({ role }: CredentialsSettingsProps) {
  const { user, updateCredentials } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAdminOnly = role === 'admin';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!formData.newUsername?.trim()) newErrors.newUsername = 'New username is required';
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) return;

    const success = updateCredentials(formData.newUsername, formData.newPassword, formData.currentPassword);

    if (success) {
      setMessage({ type: 'success', text: 'Credentials updated successfully!' });
      setFormData({
        currentPassword: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      setMessage({ type: 'error', text: 'Current password is incorrect' });
    }
  };

  return (
    <Card className="border-green-200 border-2">
      <CardHeader>
        <CardTitle>Change Credentials</CardTitle>
      </CardHeader>
      <CardContent>
        {!isAdminOnly && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800 flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>Managers cannot change their username. Contact your admin to change credentials.</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
            <Input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              placeholder="Enter your current password"
              className={errors.currentPassword ? 'border-red-500' : 'border-green-200'}
              disabled={!isAdminOnly}
            />
            {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Username *</label>
            <div className="text-xs text-gray-600 mb-1">Current username: <strong>{user?.username}</strong></div>
            <Input
              type="text"
              value={formData.newUsername}
              onChange={(e) => setFormData({ ...formData, newUsername: e.target.value })}
              placeholder="Enter new username"
              className={errors.newUsername ? 'border-red-500' : 'border-green-200'}
              disabled={!isAdminOnly}
            />
            {errors.newUsername && <p className="text-red-500 text-xs mt-1">{errors.newUsername}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
            <Input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="Enter new password (min 6 characters)"
              className={errors.newPassword ? 'border-red-500' : 'border-green-200'}
              disabled={!isAdminOnly}
            />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              className={errors.confirmPassword ? 'border-red-500' : 'border-green-200'}
              disabled={!isAdminOnly}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {message && (
            <div className={`flex items-center gap-2 p-3 rounded ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <Button type="submit" disabled={!isAdminOnly} className="bg-green-600 hover:bg-green-700">
            Update Credentials
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Security Tips:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Use a strong password with mixed characters</li>
            <li>• Keep your credentials secure and don&apos;t share with others</li>
            <li>• Change your password regularly for better security</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
