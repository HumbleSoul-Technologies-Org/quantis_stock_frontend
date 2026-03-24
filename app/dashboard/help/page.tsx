'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FAQSection } from '@/components/help/FAQSection';
import { DemoGuide } from '@/components/help/DemoGuide';
import { ContactForm } from '@/components/help/ContactForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Keyboard } from 'lucide-react';

export default function HelpPage() {
  const [selectedTab, setSelectedTab] = useState('faq');

  const shortcuts = [
    { key: 'Ctrl/Cmd + K', action: 'Quick search' },
    { key: 'Ctrl/Cmd + S', action: 'Save current form' },
    { key: 'Esc', action: 'Close modal/popup' },
    { key: 'Tab', action: 'Navigate form fields' },
    { key: 'Enter', action: 'Submit form' },
  ];

  const troubleshooting = [
    {
      issue: 'Low stock alerts not showing',
      solution: 'Make sure you have enabled low stock alerts in Settings > Notifications. Also check that your products have reorder levels set.',
    },
    {
      issue: 'Sales not updating inventory',
      solution:
        'Sales automatically deduct from inventory. If inventory isn\'t updating, try refreshing the page. If the issue persists, contact support.',
    },
    {
      issue: 'Cannot delete a product',
      solution: 'You can only delete products if you have admin or manager role. If you own sales related to this product, consider adjusting stock instead.',
    },
    {
      issue: 'Currency symbol not displaying correctly',
      solution:
        'Go to Settings > Currency and verify your currency settings. Clear your browser cache and refresh the page if changes don\'t appear immediately.',
    },
    {
      issue: 'Stuck in login page after logout',
      solution:
        'Clear your browser cookies and cache, then try logging in again. If the issue persists, use incognito/private mode to test.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-8 h-8 text-green-600" />
          Help & Support
        </h1>
        <p className="text-gray-600 mt-2">Get help with StockOS and find solutions to common issues</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 bg-gray-100 p-1">
          <TabsTrigger value="faq" className="text-xs md:text-sm">FAQs</TabsTrigger>
          <TabsTrigger value="demo" className="text-xs md:text-sm">Demo Guide</TabsTrigger>
          <TabsTrigger value="shortcuts" className="text-xs md:text-sm">Shortcuts</TabsTrigger>
          <TabsTrigger value="contact" className="text-xs md:text-sm">Contact Us</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4">
          <FAQSection />
        </TabsContent>

        <TabsContent value="demo" className="space-y-4">
          <DemoGuide />
        </TabsContent>

        <TabsContent value="shortcuts" className="space-y-4">
          <Card className="border-green-200 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Keyboard Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-6">
                Use these keyboard shortcuts to work more efficiently in StockOS.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-green-200 bg-green-50">
                      <th className="text-left p-3 font-semibold text-gray-700">Shortcut</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortcuts.map((shortcut, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3">
                          <kbd className="px-2 py-1 bg-gray-200 text-gray-900 rounded text-xs font-mono font-semibold">
                            {shortcut.key}
                          </kbd>
                        </td>
                        <td className="p-3 text-gray-700">{shortcut.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Some shortcuts may vary depending on your keyboard layout and browser. These are standard web shortcuts.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <ContactForm />
        </TabsContent>
      </Tabs>

      <Card className="border-amber-200 border-2 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-900">Troubleshooting Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {troubleshooting.map((item, idx) => (
            <div key={idx} className="pb-4 border-b border-amber-200 last:border-b-0">
              <h3 className="font-semibold text-amber-900 mb-2">❓ {item.issue}</h3>
              <p className="text-sm text-amber-800">✓ {item.solution}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-green-200 border-2">
        <CardHeader>
          <CardTitle>About StockOS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>StockOS</strong> is a modern, user-friendly stock management system designed to help businesses efficiently manage their inventory,
            sales, and supplier relationships.
          </p>
          <p>
            <strong>Features:</strong> Real-time inventory tracking, sales management, supplier management, comprehensive reporting, role-based access control,
            and customizable settings.
          </p>
          <p>
            <strong>Support:</strong> For additional help, contact our support team using the form above. We&apos;re here to help you succeed!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
