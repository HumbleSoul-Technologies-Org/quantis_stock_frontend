/**
 * Receipt Formatter for ESC/POS thermal printers
 */
import type { ReceiptData } from './printService';

const ESC = '\x1b';
const GS = '\x1d';

const CMD_INIT = ESC + '@';
const CMD_CENTER = ESC + 'a\x01';
const CMD_LEFT = ESC + 'a\x00';
const CMD_RIGHT = ESC + 'a\x02';
const CMD_BOLD_ON = ESC + 'E\x01';
const CMD_BOLD_OFF = ESC + 'E\x00';
// Changed Cut command to "Partial Cut" which is safer for 80mm rolls
const CMD_CUT = GS + 'V\x41\x03'; 
const LF = '\n';
const SEPARATOR_DASHED = '-'.repeat(42);
const SEPARATOR_SOLID = '='.repeat(42);

export function formatReceiptForThermal(receiptData: ReceiptData): string {
  // Start with INIT to clear any previous partial states
  let output = CMD_INIT;

  // HEADER
  output += CMD_CENTER + CMD_BOLD_ON;
  output += (receiptData.businessName || 'BUSINESS NAME').toUpperCase() + LF;
  output += CMD_BOLD_OFF;

  if (receiptData.businessAddress) output += receiptData.businessAddress + LF;
  if (receiptData.businessPhone) output += receiptData.businessPhone + LF;

  output += CMD_BOLD_ON + 'SALES RECEIPT' + LF + CMD_BOLD_OFF;
  output += SEPARATOR_DASHED + LF;

  // TRANSACTION DETAILS
  output += CMD_LEFT;
  output += `Date: ${formatDate(receiptData.date)}` + LF;
  output += `Receipt #: ${receiptData.saleNumber}` + LF;
  output += `Cashier: ${receiptData.cashier || 'N/A'}` + LF;
  output += `Customer: ${receiptData.customerName || 'Walk-in'}` + LF;
  output += SEPARATOR_DASHED + LF;

  // ITEMS TABLE
  output += CMD_BOLD_ON + buildTableHeader(42) + LF + CMD_BOLD_OFF;

  if (receiptData.items && receiptData.items.length > 0) {
    receiptData.items.forEach(item => {
      const itemLines = buildItemLines(item, 42);
      output += itemLines.join(LF) + LF;
    });
  } else {
    output += padCenter('No items', 42) + LF;
  }

  output += SEPARATOR_DASHED + LF;

  // TOTALS
  output += CMD_BOLD_ON;
  output += padBetween('TOTAL:', formatCurrency(receiptData.totalAmount), 42) + LF;
  output += CMD_BOLD_OFF + SEPARATOR_SOLID + LF;

  // PAYMENT & NOTES
  const paymentLines: string[] = [];
  if (receiptData.paymentType) paymentLines.push(`Payment: ${receiptData.paymentType}`);
  if (receiptData.txnId) paymentLines.push(`Txn ID: ${receiptData.txnId}`);
  if (receiptData.notes) {
      // Wrap notes so they don't break the layout
      const wrapped = wrapText(receiptData.notes, 38).split(LF);
      paymentLines.push(...wrapped);
  }

  if (paymentLines.length > 0) {
    output += buildAsciiBox(paymentLines, 42);
  }

  // FOOTER
  output += CMD_CENTER + CMD_BOLD_ON + LF + 'THANK YOU!' + LF + CMD_BOLD_OFF;
  output += 'Please visit us again' + LF;
  output += SEPARATOR_DASHED + LF;

  // IMPORTANT: The "Print and Feed" command
  // We feed 3 lines so the bottom of the receipt clears the cutter blade
  output += ESC + 'd\x03'; 
  output += CMD_CUT;

  return output;
}

// ... Keep your helper functions (formatDate, formatCurrency, etc.) exactly as they were

/**
 * Format date as "DD/MM/YYYY HH:MM"
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Format currency value
 */
function formatCurrency(amount: number): string {
  // Format as comma-separated number with 2 decimals
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Build table header: "Item  Qty  Price  Total"
 */
function buildTableHeader(width: number): string {
  const itemLabel = 'Item';
  const qtyLabel = 'Qty';
  const priceLabel = 'Price';
  const totalLabel = 'Total';

  // Approximate column widths for 42-char line
  // Item: 20, Qty: 6, Price: 8, Total: 8
  let line = itemLabel.padEnd(20);
  line += qtyLabel.padEnd(6);
  line += priceLabel.padEnd(8);
  line += totalLabel.padEnd(8);

  return line.substring(0, width);
}

/**
 * Build item row with name, qty, price, total
 */
function buildItemLines(item: any, width: number): string[] {
  const quantity = item.quantity.toString();
  const unitPrice = formatCurrency(item.unitPrice);
  const total = formatCurrency(item.total);

  const qtyColWidth = 6;
  const priceColWidth = 8;
  const totalColWidth = 8;
  const itemNameWidth = width - qtyColWidth - priceColWidth - totalColWidth;

  const itemName = item.name || 'Product';
  const wrappedNameLines = wrapText(itemName, itemNameWidth).split(LF);
  const lines: string[] = [];

  wrappedNameLines.forEach((nameLine, index) => {
    if (index === 0) {
      const line =
        nameLine.padEnd(itemNameWidth) +
        quantity.padEnd(qtyColWidth) +
        unitPrice.padStart(priceColWidth) +
        total.padStart(totalColWidth);
      lines.push(line.substring(0, width));
    } else {
      lines.push(nameLine.padEnd(width));
    }
  });

  return lines;
}

function buildAsciiBox(lines: string[], width: number): string {
  const innerWidth = width - 2;
  let output = '+' + '-'.repeat(innerWidth) + LF;

  lines.forEach(line => {
    const truncated = line.substring(0, innerWidth);
    output += '|' + truncated.padEnd(innerWidth) + '|' + LF;
  });

  output += '+' + '-'.repeat(innerWidth) + LF;
  return output;
}

/**
 * Pad text between left and right edges
 */
function padBetween(left: string, right: string, width: number): string {
  if (left.length + right.length >= width) {
    return (left + ' ' + right).substring(0, width);
  }
  const spacer = ' '.repeat(width - left.length - right.length);
  return left + spacer + right;
}

/**
 * Center text within width
 */
function padCenter(text: string, width: number): string {
  if (text.length >= width) {
    return text.substring(0, width);
  }
  const leftPad = Math.floor((width - text.length) / 2);
  return ' '.repeat(leftPad) + text;
}

/**
 * Wrap text to width, preserving lines
 */
function wrapText(text: string, width: number): string {
  const lines: string[] = [];
  const words = text.split(' ');
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + ' ' + word).length <= width) {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines.join(LF);
}