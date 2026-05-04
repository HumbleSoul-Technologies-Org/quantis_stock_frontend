/**
 * Print Service for QZ Tray integration
 * Handles USB thermal printer communication for POS receipts
 */

declare global {
  interface Window {
    qz: any;
  }
}

export interface ReceiptData {
  saleNumber: string;
  date: string;
  customerName?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
  paymentType?: string;
  txnId?: string;
  notes?: string;
  cashier: string;
}

export class PrintService {
  private qz: any = null;
  private isConnected = false;
  private selectedPrinter: string | null = null;

  constructor() {
    if (typeof window === 'undefined') {
      console.warn('[PRINT] Browser environment not available');
      return;
    }
    if (!window.qz) {
      console.warn('[PRINT] QZ Tray not loaded. Make sure qz-tray.js is included.');
      return;
    }
    this.qz = window.qz;
    this.initializeSecurity();
    this.loadSelectedPrinter();
  }

  private initializeSecurity() {
    if (!this.qz) return;

    // For development: Use dummy certificate and signature
    // In production: Replace with real signed certificate
    this.qz.security.setCertificatePromise(() => {
      return Promise.resolve(`
-----BEGIN CERTIFICATE-----
MIICiTCCAg+gAwIBAgIJAJ8l4HnPq7F8MAOGA1UEBhMCVVMxCzAJBgNVBAgTAkNB
... (placeholder - replace with real certificate)
-----END CERTIFICATE-----
      `.trim());
    });

    this.qz.security.setSignaturePromise((toSign: string) => {
      return Promise.resolve('dummy-signature-for-development');
    });
  }

  private loadSelectedPrinter() {
    if (typeof window !== 'undefined') {
      this.selectedPrinter = localStorage.getItem('selectedPrinter');
    }
  }

  private saveSelectedPrinter(printer: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedPrinter', printer);
      this.selectedPrinter = printer;
    }
  }

  async connect(): Promise<boolean> {
    if (!this.qz) {
      throw new Error('QZ Tray not available');
    }

    try {
      await this.qz.websocket.connect();
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('[PRINT] Connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.qz && this.isConnected) {
      try {
        await this.qz.websocket.disconnect();
      } catch (error) {
        console.error('[PRINT] Disconnect error:', error);
      }
      this.isConnected = false;
    }
  }

  async getPrinters(): Promise<string[]> {
    if (!this.qz || !this.isConnected) {
      throw new Error('Not connected to QZ Tray');
    }

    try {
      const printers = await this.qz.printers.find();
      return printers;
    } catch (error) {
      console.error('[PRINT] Failed to get printers:', error);
      return [];
    }
  }

  async getDefaultPrinter(): Promise<string | null> {
    if (!this.qz || !this.isConnected) {
      throw new Error('Not connected to QZ Tray');
    }

    try {
      const printer = await this.qz.printers.getDefault();
      return printer;
    } catch (error) {
      console.error('[PRINT] Failed to get default printer:', error);
      return null;
    }
  }

  async findPrinter(name: string): Promise<string | null> {
    if (!this.qz || !this.isConnected) {
      throw new Error('Not connected to QZ Tray');
    }

    try {
      const printer = await this.qz.printers.find(name);
      return printer || null;
    } catch (error) {
      console.error('[PRINT] Failed to find printer:', error);
      return null;
    }
  }

  setSelectedPrinter(printer: string) {
    this.saveSelectedPrinter(printer);
  }

  getSelectedPrinter(): string | null {
    return this.selectedPrinter;
  }

  async printReceipt(receiptData: ReceiptData): Promise<void> {
    if (!this.qz || !this.isConnected) {
      throw new Error('Not connected to QZ Tray');
    }

    let printer = this.selectedPrinter;
    if (!printer) {
      printer = await this.getDefaultPrinter();
      if (!printer) {
        throw new Error('No printer available');
      }
    }

    // Import receipt formatter
    const { formatReceiptForThermal } = await import('./receiptFormatter');
    const escPosData = formatReceiptForThermal(receiptData);

    const config = this.qz.configs.create(printer, { encoding: 'UTF-8' });

    try {
      await this.qz.print(config, [escPosData]);
    } catch (error) {
      console.error('[PRINT] Print failed:', error);
      throw error;
    }
  }

  isQzAvailable(): boolean {
    return !!this.qz;
  }

  isQzConnected(): boolean {
    return this.isConnected;
  }
}

export const printService = new PrintService();