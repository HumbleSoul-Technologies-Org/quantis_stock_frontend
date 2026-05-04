/**
 * Receipt Formatter for ESC/POS thermal printers
 * Converts receipt data to ESC/POS command bytes
 */

import type { ReceiptData } from './printService';

// ESC/POS Commands
const ESC = '\x1b';
const GS = '\x1d';
const LF = '\x0a';

const CMD_INIT = ESC + '@';
const CMD_CENTER = ESC + 'a\x01';
const CMD_LEFT = ESC + 'a\x00';
const CMD_BOLD_ON = ESC + 'E\x01';
const CMD_BOLD_OFF = ESC + 'E\x00';
const CMD_CUT = GS + 'V\x42\x00';
const CMD_FEED_2 = ESC + 'd\x02';

export function formatReceiptForThermal(receiptData: ReceiptData): Uint8Array {
  let commands = '';

  // Initialize printer
  commands += CMD_INIT;

  // Header
  commands += CMD_CENTER;
  commands += CMD_BOLD_ON;
  commands += 'RECEIPT\n';
  commands += CMD_BOLD_OFF;
  commands += `Sale #${receiptData.saleNumber}\n`;
  commands += formatDate(receiptData.date) + '\n';
  if (receiptData.customerName) {
    commands += `Customer: ${receiptData.customerName}\n`;
  }
  commands += '\n';

  // Items header
  commands += CMD_LEFT;
  commands += CMD_BOLD_ON;
  commands += padRight('Item', 20) + padLeft('Qty', 6) + padLeft('Price', 8) + '\n';
  commands += CMD_BOLD_OFF;
  commands += '-'.repeat(34) + '\n';

  // Items
  receiptData.items.forEach(item => {
    const name = item.name.length > 18 ? item.name.substring(0, 18) + '...' : item.name;
    commands += padRight(name, 20);
    commands += padLeft(item.quantity.toString(), 6);
    commands += padLeft(formatCurrency(item.unitPrice), 8) + '\n';
  });

  commands += '-'.repeat(34) + '\n';

  // Total
  commands += CMD_BOLD_ON;
  commands += padRight('TOTAL', 26) + padLeft(formatCurrency(receiptData.totalAmount), 8) + '\n';
  commands += CMD_BOLD_OFF;

  // Payment info
  if (receiptData.paymentType) {
    commands += '\n';
    commands += `Payment: ${receiptData.paymentType}\n`;
    if (receiptData.txnId) {
      commands += `Txn ID: ${receiptData.txnId}\n`;
    }
  }

  // Notes
  if (receiptData.notes) {
    commands += '\n';
    commands += `Notes: ${receiptData.notes}\n`;
  }

  // Footer
  commands += '\n';
  commands += CMD_CENTER;
  commands += `Cashier: ${receiptData.cashier}\n`;
  commands += 'Thank you for your business!\n';

  // Feed and cut
  commands += CMD_FEED_2;
  commands += CMD_CUT;

  // Convert to Uint8Array
  return new TextEncoder().encode(commands);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

function padRight(str: string, length: number): string {
  return str.padEnd(length, ' ');
}

function padLeft(str: string, length: number): string {
  return str.padStart(length, ' ');
}