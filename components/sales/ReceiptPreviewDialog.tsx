"use client";

import { useEffect } from "react";
import { Sale, Product } from "@/lib/types";
import { ReceiptTemplate } from "./ReceiptTemplate";

interface ReceiptPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  products: Product[];
  onPrint?: (receiptData: Record<string, unknown>) => Promise<void>;
}

export function ReceiptPreviewDialog({
  isOpen,
  onOpenChange,
  sale,
  products,
}: ReceiptPreviewDialogProps) {
  useEffect(() => {
    if (!isOpen || !sale) return;

    const printReceipt = () => {
      if (typeof window !== "undefined" && window.print) {
        window.print();
      }
    };

    const handleAfterPrint = () => {
      onOpenChange(false);
    };

    const timeout = window.setTimeout(printReceipt, 150);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [isOpen, sale, onOpenChange]);

  if (!isOpen || !sale) return null;

  return (
    <div className="receipt-print-area">
      <ReceiptTemplate payLoad={{ ...sale, products }} />
      <style>{`
        @media screen {
          .receipt-print-area {
            display: none;
          }
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          body * {
            visibility: hidden;
          }
          .receipt-print-area,
          .receipt-print-area * {
            visibility: visible;
          }
          .receipt-print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            background: white;
          }
          .receipt-container {
            margin: 0 auto;
            width: 80mm;
            max-width: 100%;
            padding: 12px;
            border: none;
            border-radius: 0;
            box-shadow: none;
            background: white;
          }
          .receipt-container table {
            width: 100%;
            border-collapse: collapse;
          }
          .receipt-container th,
          .receipt-container td {
            border: none;
            padding: 2px 0;
          }
          .receipt-container th {
            font-weight: 700;
          }
          .receipt-container .receipt-header,
          .receipt-container .totals-section,
          .receipt-container .payment-info {
            border-color: #000;
          }
        }
      `}</style>
    </div>
  );
}
