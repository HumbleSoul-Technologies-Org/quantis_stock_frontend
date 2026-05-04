"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FAQSection } from "@/components/help/FAQSection";
import { ContactForm } from "@/components/help/ContactForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HelpCircle,
  Keyboard,
  BookOpen,
  Zap,
  Users,
  Package,
} from "lucide-react";

export default function HelpPage() {
  const [selectedTab, setSelectedTab] = useState("getting-started");

  const shortcuts = [
    { key: "Ctrl/Cmd + K", action: "Quick search" },
    { key: "Ctrl/Cmd + S", action: "Save current form" },
    { key: "Esc", action: "Close modal/popup" },
    { key: "Tab", action: "Navigate form fields" },
    { key: "Enter", action: "Submit form" },
  ];

  const gettingStarted = [
    {
      title: "Understanding the Dashboard",
      description: "Your central hub for business overview",
      steps: [
        "The Dashboard displays key metrics at a glance",
        "View today's sales, recent activity, and quick stats",
        "Access all major sections (Inventory, Sales, Products, etc.) from the sidebar",
        "Use the top navigation for user profile, notifications, and settings",
      ],
    },
    {
      title: "Managing Products",
      description: "Organize and track your product catalog",
      steps: [
        "Go to Products section to view all available items",
        "Click 'Add Product' to create new products with details like SKU, category, pricing",
        "Set reorder levels to trigger low stock alerts",
        "Edit products to update prices, descriptions, or availability status",
        "Products can only be deleted if they have no sales history",
      ],
    },
    {
      title: "Recording Sales",
      description: "Process customer transactions and track revenue",
      steps: [
        "Navigate to Sales section and click 'Record New Sale'",
        "Enter customer details and select payment method (cash, card, transfer, etc.)",
        "Add products by selecting them from dropdown and entering quantities",
        "Review the sale items and total amount before submitting",
        "Sales automatically deduct from inventory and appear in stock movements",
        "View all sales history with filtering and search options",
      ],
    },
    {
      title: "Managing Inventory",
      description: "Track stock levels and movements",
      steps: [
        "Inventory section shows real-time stock levels for all products",
        "View detailed stock history for each product",
        "Manually adjust stock using 'Add Inventory' for receiving stock",
        "Stock movements are automatically created for every inventory change",
        "Track stock type (in/out/adjustment) with reasons and references",
        "Monitor low stock items that need reordering",
      ],
    },
    {
      title: "Managing Suppliers",
      description: "Keep track of your supply chain",
      steps: [
        "Add supplier information including contact details and payment terms",
        "Track purchase orders and delivery history with suppliers",
        "Link suppliers to products to manage multiple supply sources",
        "Update supplier status (active/inactive) as needed",
        "Use supplier data for reordering and negotiations",
      ],
    },
    {
      title: "Generating Reports",
      description: "Analyze business performance and trends",
      steps: [
        "Reports section provides three main report types: Inventory, Sales, Stock Movements",
        "Inventory Report shows product details, stock levels, and inventory values",
        "Sales Report lists all sales transactions with customer and payment details",
        "Stock Movements Report tracks all inventory changes with reasons",
        "Export any report as CSV file for further analysis",
        "View visual summaries including top products and sales trends",
      ],
    },
    {
      title: "Configuring Settings",
      description: "Customize system behavior and preferences",
      steps: [
        "Navigate to Settings to configure your system",
        "General: Set company name, theme preference, and regional settings",
        "Currency: Define currency symbol, code, and decimal places",
        "Units: Set default units of measurement (kg, liters, units, etc.)",
        "Notifications: Enable/disable alerts for sales, low stock, etc.",
        "Credentials: Manage user accounts and team members",
      ],
    },
  ];

  const featureGuides = [
    {
      title: "Role-Based Access Control",
      icon: Users,
      description: "Different user roles with specific permissions",
      content: [
        "Admin: Full system access, can manage all features and users",
        "Manager: Can manage inventory, sales, and generate reports",
        "Sales: Can record sales and view product information",
        "Accountant: Read-only access to view transactions and reports",
      ],
    },
    {
      title: "Real-Time Data Sync",
      icon: Zap,
      description: "Automatic synchronization between local storage and API",
      content: [
        "All data is saved to local storage for offline access",
        "System syncs with API every 5 seconds when online",
        "If API is unavailable, system continues using cached data",
        "Changes sync automatically when connection is restored",
      ],
    },
    {
      title: "Stock Movement Tracking",
      icon: Package,
      description: "Complete audit trail of all inventory changes",
      content: [
        "Every inventory change creates a stock movement record",
        "Track type: 'in' (received), 'out' (sold/used), 'adjustment' (corrections)",
        "Each movement includes reason and reference (sale number, PO, etc.)",
        "Build complete history for audits and reconciliation",
      ],
    },
  ];

  const troubleshooting = [
    {
      issue: "Sales not appearing after recording",
      solution:
        "Sales are saved locally and synced to API automatically. Refresh the page to see updates. Check that you have all required fields (customer name, at least one item).",
    },
    {
      issue: "Inventory didn't decrease after sale",
      solution:
        "Sales automatically deduct from inventory. If not updating, ensure products have sufficient stock. Try refreshing the page. If persists, check that sale was successfully recorded.",
    },
    {
      issue: "Low stock alerts not showing",
      solution:
        "Enable low stock alerts in Settings > Notifications. Ensure products have reorder levels set. Alerts appear when current stock <= reorder level.",
    },
    {
      issue: "Cannot add new product",
      solution:
        "You need Manager or Admin role to add products. Check that all required fields are filled (name, SKU, category, price, etc.). Ensure SKU is unique.",
    },
    {
      issue: "CSV export is empty or incomplete",
      solution:
        "Ensure you have data in the selected report type. Check your browser's download folder. If columns are missing, verify you're viewing the full table before exporting.",
    },
    {
      issue: "Settings changes not saving",
      solution:
        "Settings are saved to local storage. Refresh the page after making changes. Check for validation errors in form fields. Clear browser cache if issues persist.",
    },
    {
      issue: "Supplier information missing",
      solution:
        "Go to Suppliers section and add supplier details. Link suppliers to products in the product editor. Ensure supplier is marked as active.",
    },
    {
      issue: "Cannot see reports data",
      solution:
        "Reports pull from your actual data. If reports are empty, ensure you have products, sales, and stock movements recorded. Check date filters if using filtered reports.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-teal-100 flex items-center gap-2">
          <HelpCircle className="w-6 sm:w-8 h-6 sm:h-8 text-green-600 dark:text-teal-400" />
          Help & Support
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 mt-1 sm:mt-2">
          Learn how to use Quantis stock and manage your inventory efficiently
        </p>
      </div>

      <Card className="border-teal-200 border-2 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-700">
        <CardContent className="pt-6">
          <p className="text-sm text-teal-900 dark:text-teal-200">
            <strong>New to Quantis stock?</strong> Start with the "Getting
            Started" tab below to understand the system and learn how to use
            each feature step-by-step.
          </p>
        </CardContent>
      </Card>

      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1 bg-gray-100 dark:bg-slate-700 p-1 h-auto">
          <TabsTrigger value="getting-started" className="text-xs md:text-sm">
            <BookOpen className="w-4 h-4 mr-1" />
            Getting Started
          </TabsTrigger>
          <TabsTrigger value="features" className="text-xs md:text-sm">
            <Zap className="w-4 h-4 mr-1" />
            Features
          </TabsTrigger>
          <TabsTrigger value="faq" className="text-xs md:text-sm">
            FAQs
          </TabsTrigger>
          {/* <TabsTrigger value="shortcuts" className="text-xs md:text-sm">
            <Keyboard className="w-4 h-4 mr-1" />
            Shortcuts
          </TabsTrigger> */}
          <TabsTrigger value="contact" className="text-xs md:text-sm">
            Contact
          </TabsTrigger>
        </TabsList>

        {/* Getting Started Tab */}
        <TabsContent value="getting-started" className="space-y-4">
          <div className="space-y-4">
            {gettingStarted.map((guide, idx) => (
              <Card
                key={idx}
                className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700"
              >
                <CardHeader>
                  <CardTitle className="dark:text-teal-100">
                    {guide.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    {guide.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2">
                    {guide.steps.map((step, stepIdx) => (
                      <li
                        key={stepIdx}
                        className="text-sm text-gray-700 dark:text-slate-300 ml-2"
                      >
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {featureGuides.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-teal-100">
                      <Icon className="w-5 h-5 text-green-600 dark:text-teal-400" />
                      {feature.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                      {feature.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.content.map((item, itemIdx) => (
                        <li
                          key={itemIdx}
                          className="text-sm text-gray-700 dark:text-slate-300 flex items-start gap-2"
                        >
                          <span className="text-green-600 dark:text-teal-400 mt-1">
                            •
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faq" className="space-y-4">
          <FAQSection />
        </TabsContent>

        {/* Shortcuts Tab */}
        <TabsContent value="shortcuts" className="space-y-4">
          <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-teal-100">
                <Keyboard className="w-5 h-5" />
                Keyboard Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-slate-400 text-sm mb-6">
                Use these keyboard shortcuts to work more efficiently in Quantis
                stock.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-green-200 dark:border-teal-700 bg-green-50 dark:bg-slate-700">
                      <th className="text-left p-3 font-semibold text-gray-700 dark:text-slate-300">
                        Shortcut
                      </th>
                      <th className="text-left p-3 font-semibold text-gray-700 dark:text-slate-300">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortcuts.map((shortcut, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <td className="p-3">
                          <kbd className="px-2 py-1 bg-gray-200 dark:bg-slate-600 text-gray-900 dark:text-slate-100 rounded text-xs font-mono font-semibold">
                            {shortcut.key}
                          </kbd>
                        </td>
                        <td className="p-3 text-gray-700 dark:text-slate-400">
                          {shortcut.action}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded dark:bg-blue-900/20 dark:border-blue-700">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>Note:</strong> Some shortcuts may vary depending on
                  your keyboard layout and browser. These are standard web
                  shortcuts.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4">
          <ContactForm />
        </TabsContent>
      </Tabs>

      {/* Troubleshooting Guide */}
      <Card className="border-amber-200 border-2 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700">
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-200">
            Troubleshooting Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {troubleshooting.map((item, idx) => (
            <div
              key={idx}
              className="pb-4 border-b border-amber-200 dark:border-amber-700 last:border-b-0"
            >
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                ❓ {item.issue}
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                ✓ {item.solution}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* About Section */}
      <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
        <CardHeader>
          <CardTitle className="dark:text-teal-100">
            About Quantis stock
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700 dark:text-slate-400">
          <p>
            <strong className="dark:text-teal-100">Quantis stock</strong> is a
            modern, comprehensive inventory management system designed for
            businesses of all sizes to efficiently manage their stock, sales,
            and supplier relationships.
          </p>
          <div>
            <strong className="dark:text-teal-100">Core Features:</strong>
            <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
              <li>Real-time inventory tracking and stock movements</li>
              <li>Complete sales management with payment tracking</li>
              <li>Supplier management and relationships</li>
              <li>Comprehensive reporting and analytics with CSV export</li>
              <li>Role-based access control and permissions</li>
              <li>
                Customizable settings for currency, units, and notifications
              </li>
              <li>Automatic data synchronization with offline support</li>
            </ul>
          </div>
          <p>
            <strong className="dark:text-teal-100">Getting Help:</strong> Use
            this Help page to find answers. Start with "Getting Started" for
            tutorials, check FAQs for common questions, and use the Contact tab
            to reach our support team.
          </p>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="border-purple-200 border-2 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700">
        <CardHeader>
          <CardTitle className="text-purple-900 dark:text-purple-200">
            💡 Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-purple-800 dark:text-purple-300">
            • <strong>Regular Backups:</strong> Ensure your browser data is
            backed up to avoid data loss between sessions.
          </p>
          <p className="text-sm text-purple-800 dark:text-purple-300">
            • <strong>Report Analytics:</strong> Use reports regularly to
            identify trends and make data-driven decisions about inventory and
            pricing.
          </p>
          <p className="text-sm text-purple-800 dark:text-purple-300">
            • <strong>Low Stock Alerts:</strong> Set appropriate reorder levels
            to never miss stock depletion.
          </p>
          <p className="text-sm text-purple-800 dark:text-purple-300">
            • <strong>Multiple Users:</strong> Add team members with appropriate
            roles to distribute workload and maintain data integrity.
          </p>
          <p className="text-sm text-purple-800 dark:text-purple-300">
            • <strong>CSV Exports:</strong> Export reports for external
            analysis, presentations, or sharing with stakeholders.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
