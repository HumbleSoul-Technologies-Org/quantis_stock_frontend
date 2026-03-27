"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface DemoStep {
  step: number;
  title: string;
  description: string;
  details: string[];
}

const demoSteps: DemoStep[] = [
  {
    step: 1,
    title: "Understanding the Dashboard",
    description: "Your home base for quick insights",
    details: [
      "• View total products, sales, and inventory value at a glance",
      "• See low stock alerts for items that need reordering",
      "• Check recent sales and stock movements activity",
      "• Monitor key metrics to manage your business efficiently",
    ],
  },
  {
    step: 2,
    title: "Adding Your First Product",
    description: "Create a new product in your inventory",
    details: [
      "• Go to Products page",
      '• Click "Add Product"',
      "• Fill in product details: name, SKU, category, prices, stock",
      "• Select supplier and set reorder level",
      '• Click "Add Product" to save',
    ],
  },
  {
    step: 3,
    title: "Managing Inventory",
    description: "Track stock movements and levels",
    details: [
      "• Record stock movements (in, out, or adjustments)",
      "• Add reason for movement and reference number",
      "• View complete stock history for each product",
      "• Get alerts when stock falls below reorder level",
      "• Filter movements by product to see history",
    ],
  },
  {
    step: 4,
    title: "Creating a Sale",
    description: "Process customer sales and update stock",
    details: [
      "• Go to Sales page",
      '• Click "New Sale"',
      "• Select products and quantities from inventory",
      "• Add multiple items to create a complete sale",
      "• Review totals and complete the sale",
      "• Stock automatically updates after sale",
    ],
  },
  {
    step: 5,
    title: "Viewing Reports",
    description: "Analyze your business performance",
    details: [
      "• Access Inventory Report to see stock levels and values",
      "• View Sales Report for revenue and sales trends",
      "• Check Summary for overall business metrics",
      "• Export reports as CSV for further analysis",
      "• Identify top products and low stock items",
    ],
  },
  {
    step: 6,
    title: "Configuring Settings",
    description: "Customize the system for your business",
    details: [
      "• Set your company name and contact email",
      "• Choose currency and decimal format",
      "• Select measurement units (kg, L, units, etc.)",
      "• Enable/disable notifications (email, SMS, low stock)",
      "• Change your login credentials securely",
    ],
  },
];

export function DemoGuide() {
  return (
    <div className="space-y-4">
      <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
        <CardHeader>
          <CardTitle className="dark:text-teal-100">
            System Demo Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-slate-400 text-sm mb-6">
            Follow these steps to learn all the key features of StockOS. This
            guide covers everything from basic setup to advanced reporting.
          </p>

          <div className="space-y-4">
            {demoSteps.map((item) => (
              <div
                key={item.step}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-600 dark:bg-teal-600 text-white rounded-full flex-shrink-0 font-bold text-sm">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
                      {item.description}
                    </p>
                    <ul className="mt-3 space-y-1">
                      {item.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-700 dark:text-slate-300 flex items-start gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
