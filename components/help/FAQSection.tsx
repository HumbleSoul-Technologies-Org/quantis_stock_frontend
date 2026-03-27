"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: "1",
    question: "How do I add a new product?",
    answer:
      'Navigate to Products from the sidebar. Click "Add Product" and fill in the required information including name, SKU, category, price, and stock level. Then click "Add Product" to save it.',
  },
  {
    id: "2",
    question: "How do I manage inventory levels?",
    answer:
      "Go to Inventory Management section. You can record stock movements (in/out/adjustment), view stock history for each product, and set reorder levels. The system will alert you when stock falls below the reorder level.",
  },
  {
    id: "3",
    question: "How do I create a sale?",
    answer:
      'Click "New Sale" on the Sales page. Select products from available inventory, specify quantities, and add them to the sale. Review the total and click "Complete Sale". Stock will automatically be deducted.',
  },
  {
    id: "4",
    question: "Can I change the currency?",
    answer:
      "Yes! Go to Settings > Currency. Select your desired currency (USD, EUR, GBP, etc.) and the symbol will be applied throughout the system for all prices and reports.",
  },
  {
    id: "5",
    question: "How do I change my password?",
    answer:
      'Go to Settings > Credentials. Enter your current password, then enter your new username and password. Click "Update Credentials" to save changes.',
  },
  {
    id: "6",
    question: "What are low stock alerts?",
    answer:
      "When a product stock falls to or below its reorder level, the system shows a low stock alert. You can enable/disable these notifications in Settings > Notifications.",
  },
  {
    id: "7",
    question: "How do I export reports?",
    answer:
      'In the Reports section, select the report type you want (Inventory or Sales) and click "Export CSV" to download the data in CSV format that you can open in Excel.',
  },
  {
    id: "8",
    question: "What are supplier management features?",
    answer:
      "In Suppliers, you can maintain a list of vendors with their contact information, payment terms, and website. Link suppliers to products and track your supplier relationships.",
  },
  {
    id: "9",
    question: "How do I view recent activity?",
    answer:
      "The Dashboard shows recent activity including recent sales and stock movements. This gives you a quick overview of what&apos;s happening in your inventory.",
  },
  {
    id: "10",
    question: "Can I change measurement units?",
    answer:
      "Yes! Go to Settings > Units. You can choose different units for weight (kg, lbs), volume (L, gallons), and count (units, boxes). These are used throughout product management.",
  },
  {
    id: "11",
    question: "How do role-based permissions work?",
    answer:
      "Admin: Full access to all features. Manager: Can manage products, inventory, and reports. Sales: Can only view products and create sales. Some features like settings are restricted based on role.",
  },
  {
    id: "12",
    question: "What happens if I delete a product?",
    answer:
      "Deleting a product removes it from your inventory. Historical sales involving that product will still be available in your sales records, but you won&apos;t be able to create new sales for it.",
  },
];

export function FAQSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
      <CardHeader>
        <CardTitle className="dark:text-teal-100">
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleExpand(faq.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 text-left"
            >
              <p className="font-medium text-gray-900 dark:text-slate-100">
                {faq.question}
              </p>
              {expandedId === faq.id ? (
                <ChevronUp className="w-5 h-5 text-green-600 dark:text-teal-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              )}
            </button>
            {expandedId === faq.id && (
              <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 p-4">
                <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
