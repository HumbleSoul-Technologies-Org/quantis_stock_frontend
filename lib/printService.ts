/**
 * Print Service for QZ Tray integration
 * Handles USB thermal printer communication for POS receipts
 */

import { encryptedStorageService } from '@/lib/encryptedStorage';
import { sessionKeyManager } from '@/lib/sessionKeyManager';

declare global {
  interface Window {
    qz: any;
  }
}

export interface ReceiptData {
  // Transaction info
  saleNumber: string;
  date: string;
  
  // Customer info
  customerName?: string;
  cashier: string;
  
  // Business info
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  
  // Items
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
  
  // Payment info
  paymentType?: string;
  txnId?: string;
  notes?: string;
}

const DEFAULT_QZ_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIID3zCCAsegAwIBAgIURvmMrqlzTpCbhyH1O21cr2WGfjswDQYJKoZIhvcNAQEL
BQAwfzELMAkGA1UEBhMCVUcxEDAOBgNVBAgMB25hbWFudmUxETAPBgNVBAcMCGth
bWFwYWxhMR8wHQYDVQQKDBZodW1ibGVzb3VsdGVjaG5vbG9naWVzMSowKAYJKoZI
hvcNAQkBFhtraXNpYm9qb25hdGhhbjE1MEBnbWFpbC5jb20wHhcNMjYwNTA2MTMz
NTI5WhcNMjcwNTA2MTMzNTI5WjB/MQswCQYDVQQGEwJVRzEQMA4GA1UECAwHbmFt
YW52ZTERMA8GA1UEBwwIa2FtYXBhbGExHzAdBgNVBAoMFmh1bWJsZXNvdWx0ZWNo
bm9sb2dpZXMxKjAoBgkqhkiG9w0BCQEWG2tpc2lib2pvbmF0aGFuMTUwQGdtYWls
LmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALklYTGzJp0hXXaN
8QIGBDHMRatCgV/OFd1hbZyAtKS46hg1nPg7HYlfksXW+JGHNOgCOQx+HWTaoN1z
HCYoSywmPSlIhUi4Bq5WU45X1XquHt4WyY7MaHc8kyKeEep6Aw36obad+xAbZJH5
cAQ+lihuEvcTslxao3OYw7LRbLQwZNRajZQaPQ9VSjTxT/5nddhC1KSfvZCf7pwu
L1SdtjDO7YeuTjDQq1Bsd9J6DhCDSNNpMIHjom5Kg8yuOyeRM7nBcSoG4Sd5muOd
gVZpgNgNP5KCEoQPOl0KepP7bqirkTIRtwoqE1/m/eiVgtjGKzBxKSpnVd8I/C+S
uXXj1k0CAwEAAaNTMFEwHQYDVR0OBBYEFHxO6i4bd0crNl24MXkP6KSK9RkfMB8G
A1UdIwQYMBaAFHxO6i4bd0crNl24MXkP6KSK9RkfMA8GA1UdEwEB/wQFMAMBAf8w
DQYJKoZIhvcNAQELBQADggEBAGAGbB5pZzYZYBplD7VQy5L4mS+NK1m+hFiUIwVq
VLSid4v7ie+ZYydMuMTzZbpTsO4REWuXpvFn3WdNlwYTwTQCU0DQqwg8B66lX36g
ZOoTkKNj1VxJAy82XMWqOHrIKxtq31vcKC+njLlTQfvij+fiafO5PF428bgpHFEg
QJ0xOfPnvKfzqhP6ix8MEhSJFWrsu7zLsf8ow67K6XhU9ulxEwcA3xP3p7j3wL64
n/Hai7zRqO+RBXIWAm6Ulkhz1XuYo99C7VtcOuk0z8I974iAxzGuuREGjvuUAxJb
YdydS9p1pqK3yPJq9C6k5e7HbsTKrlcQJ9neuTfCSp1mlRo=
-----END CERTIFICATE-----
`;

export class PrintService {
  private qz: any = null;
  private isConnected = false;
  private selectedPrinter: string | null = null;

  constructor() {
    if (typeof window === 'undefined') {
      console.warn('[PRINT] Browser environment not available');
      return;
    }

    this.initialize();
  }

  private initialize() {
    if (this.qz || typeof window === 'undefined') {
      return;
    }

    if (window.qz) {
      this.bindQz(window.qz);
      return;
    }

    const tryBind = () => {
      if (window.qz) {
        this.bindQz(window.qz);
        window.removeEventListener('load', tryBind);
      }
    };

    window.addEventListener('load', tryBind);
  }

  private bindQz(qz: any) {
    this.qz = qz;
    this.initializeSecurity();
    this.bindWebsocketCallbacks();
    this.loadSelectedPrinter();
  }

  private bindWebsocketCallbacks() {
    if (!this.qz?.websocket) {
      return;
    }

    const websocket = this.qz.websocket;

    if (typeof websocket.setClosedCallbacks === 'function') {
      websocket.setClosedCallbacks(() => {
        this.isConnected = false;
        console.info('[PRINT] QZ Tray websocket closed');
      });
    }

    if (typeof websocket.setErrorCallbacks === 'function') {
      websocket.setErrorCallbacks((error: unknown) => {
        this.isConnected = false;
        console.error('[PRINT] QZ Tray websocket error:', error);
      });
    }
  }

  private initializeSecurity() {
    if (!this.qz || !this.qz.security) {
      return;
    }

    // Certificate: Fetch from backend endpoint
    this.qz.security.setCertificatePromise(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/printing/certificate`);
        if (!response.ok) {
          throw new Error(`Failed to fetch certificate: ${response.statusText}`);
        }
        const certificate = await response.text();
       console.log('====================================');
       console.log('[PRINT] Certificate fetched from backend');
       console.log('====================================');
        return certificate;
      } catch (error) {
        console.error('[PRINT] Failed to fetch certificate:', error);
        // Fallback to environment certificate
        return this.getCertificate();
      }
    });

    // Signature: Post to backend signing endpoint
    this.qz.security.setSignaturePromise(async (toSign: string) => {
      try {
        // Get auth token from encrypted session
        const token = await this.getAuthToken();
        
        if (!token) {
          console.error('[PRINT] No authentication token available for signing');
          throw new Error('Not authenticated for printing');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/printing/sign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ toSign }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Signing failed: ${response.statusText}`);
        }

        const data = await response.text();
         console.log('====================================');''
         console.log('[PRINT] Successfully signed print request');
         console.log('====================================');
        return data;
      } catch (error) {
        console.error('[PRINT] Signing error:', error);
        throw error;
      }
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

  private async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      // Try encrypted session first
      if (sessionKeyManager.isInitialized()) {
        const user = await encryptedStorageService.getDecrypted<any>('erp_user_session');
        if (user?.token) {
          return user.token;
        }
      }

      // Fallback to unencrypted
      const stored = localStorage.getItem('erp_user_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.token || null;
      }

      return null;
    } catch (error) {
      console.error('[PRINT] Failed to retrieve auth token:', error);
      return null;
    }
  }

  private getCertificate(): string {
    return (
      process.env.NEXT_PUBLIC_QZ_CERTIFICATE?.trim() ||
      DEFAULT_QZ_CERTIFICATE
    ).trim();
  }

  private getConnectOptions() {
    return {
      host: ['localhost', 'localhost.qz.io'],
      port: {
        secure: [8181, 8282, 8383, 8484],
        insecure: [8182, 8283, 8384, 8485],
      },
      usingSecure: window.location.protocol === 'https:',
      retries: 1,
      delay: 0,
    };
  }

  private ensureQz(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    if (!this.qz && window.qz) {
      this.bindQz(window.qz);
    }

    return !!this.qz;
  }

  private isQzWebsocketActive(): boolean {
    if (!this.qz || !this.qz.websocket) {
      return false;
    }

    const websocket = this.qz.websocket;
    const connection = websocket.connection;

    if (connection && typeof connection.established === 'boolean') {
      return connection.established;
    }

    if (!connection) {
      return false;
    }

    const activeIndicator = websocket.isActive;
    if (typeof activeIndicator === 'function') {
      try {
        return activeIndicator();
      } catch (error) {
        console.warn('[PRINT] QZ Tray websocket active check failed:', error);
        return false;
      }
    }

    if (typeof activeIndicator === 'boolean') {
      return activeIndicator;
    }

    if (typeof websocket.active === 'boolean') {
      return websocket.active;
    }

    return false;
  }

  private resetConnectionState() {
    this.isConnected = false;
  }

  public isQzAvailable(): boolean {
    return this.ensureQz();
  }

  public isQzConnected(): boolean {
    return this.isConnected || this.isQzWebsocketActive();
  }

  public async ensureConnected(): Promise<boolean> {
    if (!this.ensureQz()) {
      return false;
    }

    if (this.isQzConnected()) {
      this.isConnected = true;
      return true;
    }

    return this.connect();
  }

  private async connect(): Promise<boolean> {
    if (!this.qz || !this.qz.websocket) {
      return false;
    }

    try {
      await this.qz.websocket.connect(this.getConnectOptions());
      this.isConnected = true;
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (
        message.includes('An open connection with QZ Tray already exists') ||
        this.isQzWebsocketActive()
      ) {
        this.isConnected = true;
        return true;
      }

      if (message.includes('Connection blocked by client')) {
        console.error(
          '[PRINT] QZ Tray connection blocked by client. Check browser extensions, firewall rules, and local websocket access.',
          error,
        );
      } else {
        console.error('[PRINT] QZ Tray connection failed:', error);
      }

      this.resetConnectionState();
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.ensureQz() || !this.qz?.websocket) {
      return;
    }

    if (!this.isQzConnected()) {
      this.resetConnectionState();
      return;
    }

    try {
      await this.qz.websocket.disconnect();
    } catch (error) {
      console.error('[PRINT] QZ Tray disconnect error:', error);
    }

    this.resetConnectionState();
  }

  public async getPrinters(): Promise<string[]> {
    if (!this.ensureQz() || !this.isQzConnected()) {
      throw new Error('Not connected to QZ Tray');
    }

    try {
      return await this.qz.printers.find();
    } catch (error) {
      console.error('[PRINT] Failed to get printers:', error);
      return [];
    }
  }

  public async getDefaultPrinter(): Promise<string | null> {
    if (!this.ensureQz() || !this.isQzConnected()) {
      throw new Error('Not connected to QZ Tray');
    }

    try {
      return await this.qz.printers.getDefault();
    } catch (error) {
      console.error('[PRINT] Failed to get default printer:', error);
      return null;
    }
  }

  public async findPrinter(name: string): Promise<string | null> {
    if (!this.ensureQz() || !this.isQzConnected()) {
      throw new Error('Not connected to QZ Tray');
    }

    try {
      return (await this.qz.printers.find(name)) || null;
    } catch (error) {
      console.error('[PRINT] Failed to find printer:', error);
      return null;
    }
  }

  public setSelectedPrinter(printer: string) {
    this.saveSelectedPrinter(printer);
  }

  public getSelectedPrinter(): string | null {
    return this.selectedPrinter;
  }

  private async persistReceipt(
    receiptData: ReceiptData,
    status: 'printed' | 'failed',
    printerName?: string,
    printDuration?: number,
    lastPrintError?: string
  ): Promise<void> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        console.warn('[PRINT] No token for receipt persistence');
        return;
      }

      const payload = {
        receiptData,
        status,
        printerName: printerName || null,
        printDuration: printDuration || null,
        lastPrintError: lastPrintError || null,
        metadata: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          timestamp: new Date().toISOString(),
        },
      };
const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL ;
      const response = await fetch(`${backendUrl}/receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('[PRINT] Failed to persist receipt:', errorData.error || response.statusText);
        return;
      }

      const result = await response.json();
      console.log(`[PRINT] Receipt persisted: ${result.receipt?.receiptNumber}`);
    } catch (error) {
      // Non-blocking: Log and continue
      console.warn('[PRINT] Receipt persistence error (non-blocking):', error);
    }
  }

  private showPrintingProgressDialog(): () => void {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'printing-progress-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      backdrop-filter: blur(2px);
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 300px;
      width: 90%;
      text-align: center;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    `;

    // Create spinner
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #10b981;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    `;

    // Create message
    const message = document.createElement('p');
    message.textContent = 'Printing Receipt...';
    message.style.cssText = `
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #374151;
    `;

    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    // Assemble modal
    modal.appendChild(spinner);
    modal.appendChild(message);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Return cleanup function
    return () => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }

  public async printReceipt(receiptData: ReceiptData): Promise<void> {
  if (!this.ensureQz()) {
    throw new Error('QZ Tray not available');
  }

  const connected = await this.ensureConnected();
  if (!connected) {
    throw new Error('Unable to connect to QZ Tray');
  }

  let printer = this.selectedPrinter;
  if (!printer) {
    printer = await this.getDefaultPrinter();
    if (!printer) {
      throw new Error('No printer available');
    }
  }

  const { formatReceiptForThermal } = await import('./receiptFormatter');
  const escPosString = formatReceiptForThermal(receiptData);
  const config = this.qz.configs.create(printer);

  // Format data for QZ Tray - plain text string array for ESC/POS
  const printData = [escPosString];

  // Show printing progress dialog
  const hideProgressDialog = this.showPrintingProgressDialog();

  const startTime = performance.now();

  try {
    // Note: Ensure the variable name 'printData' matches what you pass here
    await this.qz.print(config, printData); 
    const printDuration = Math.round(performance.now() - startTime);

    this.persistReceipt(receiptData, 'printed', printer, printDuration).catch(() => {
      /* Logged internally */
    });

    // Hide progress dialog on success
    hideProgressDialog();
  } catch (error) {
    const printDuration = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : String(error);

    this.persistReceipt(receiptData, 'failed', printer, printDuration, errorMessage).catch(() => {
      /* Logged internally */
    });

    // Hide progress dialog on error
    hideProgressDialog();

    console.error('[PRINT] Print failed:', error);
    throw error;
  }
}
}

export const printService = new PrintService();