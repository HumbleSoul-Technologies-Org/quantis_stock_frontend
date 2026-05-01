/**
 * Utility functions for error handling and classification
 */

/**
 * Check if an error is a network/connectivity error (not an API error)
 * Network errors should trigger offline sync queue
 * API errors (4xx, 5xx) should not be queued
 */
export function isNetworkError(error: any): boolean {
  // TypeError typically indicates network failure (fetch failed to connect)
  if (error instanceof TypeError) {
    return true;
  }

  // Check error message for network-related issues
  const errorMessage = error?.message || '';
  const networkIndicators = [
    'network',
    'offline',
    'unreachable',
    'connection',
    'failed to fetch',
    'fetch failed',
    'timeout',
    'ECONNREFUSED',
    'ENOTFOUND',
    'ERR_INTERNET_DISCONNECTED',
  ];

  if (networkIndicators.some(indicator => errorMessage.toLowerCase().includes(indicator))) {
    return true;
  }

  // If error has response object with status, it's an API error, not network error
  if (error?.response?.status) {
    return false;
  }

  // If we can't determine, assume it's a network error (safer to queue)
  return true;
}

/**
 * Extract user-friendly error message from error object
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An error occurred';
}

/**
 * Check if error is a network connectivity issue
 */
export function isConnectivityError(error: any): boolean {
  const errorMessage = error?.message?.toLowerCase() || '';
  return (
    error instanceof TypeError ||
    errorMessage.includes('network') ||
    errorMessage.includes('offline') ||
    errorMessage.includes('failed to fetch') ||
    !error?.response // No response object means network error
  );
}

/**
 * Clean payload for sync - removes temporary ID fields that cause E11000 errors
 * MongoDB will auto-generate _id and we shouldn't send empty id fields
 * Also cleans nested items arrays (e.g., in sales with line items)
 * Removes UUID reference fields that servers will reject
 */
export function cleanPayloadForSync(payload: any, method: string, operationType?: string): any {
  if (!payload) return payload;

  const cleaned = { ...payload };

  // For POST requests, remove id and _id fields completely
  if (method === 'POST') {
    delete cleaned.id;
    delete cleaned._id;
    
    // Clean nested items array if present (e.g., sale items, stock movements)
    if (Array.isArray(cleaned.items)) {
      cleaned.items = cleaned.items.map((item: any) => {
        const cleanedItem = { ...item };
        delete cleanedItem.id;
        delete cleanedItem._id;
        return cleanedItem;
      });
      console.log('🧹 [PAYLOAD CLEAN] POST payload - removed id/_id from nested items array');
    }
    
    console.log('🧹 [PAYLOAD CLEAN] POST payload cleaned - removed id/_id fields');
  }
  // For PUT requests, keep id but remove _id (for matching)
  else if (method === 'PUT') {
    delete cleaned._id; // MongoDB might reject _id on update
    
    // Clean nested items array if present
    if (Array.isArray(cleaned.items)) {
      cleaned.items = cleaned.items.map((item: any) => {
        const cleanedItem = { ...item };
        delete cleanedItem._id;
        // Keep item.id for PUT since it might be needed for mapping
        return cleanedItem;
      });
      console.log('🧹 [PAYLOAD CLEAN] PUT payload - removed _id from nested items array');
    }
    
    console.log('🧹 [PAYLOAD CLEAN] PUT payload cleaned - removed _id field');
  }

  // Remove UUID reference fields for operations that shouldn't send them or have them as UUIDs
  // Set them to empty string instead to prevent server validation errors
  const operationsWithProductRef = ['STOCK_IN', 'CREATE_SALE', 'UPDATE_SALE'];
  const operationsWithSaleRef = ['PROCESS_SALE_RETURN', 'UPDATE_SALE'];
  
  if (operationsWithProductRef.includes(operationType || '')) {
    // Check if productId looks like a UUID (temporary/offline ID)
    // UUIDs have format: 8-4-4-4-12 hex characters with dashes
    if (cleaned.productId && typeof cleaned.productId === 'string' && 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleaned.productId)) {
      console.log('🧹 [PAYLOAD CLEAN] Removing UUID productId before sync', {
        operationType,
        productId: cleaned.productId,
      });
      cleaned.productId = '';
    }
  }

  if (operationsWithSaleRef.includes(operationType || '')) {
    // Check if saleId looks like a UUID (temporary/offline ID)
    if (cleaned.saleId && typeof cleaned.saleId === 'string' && 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleaned.saleId)) {
      console.log('🧹 [PAYLOAD CLEAN] Removing UUID saleId before sync', {
        operationType,
        saleId: cleaned.saleId,
      });
      cleaned.saleId = '';
    }
  }

  return cleaned;
}

/**
 * Detect MongoDB E11000 duplicate key error
 * Indicates resource with same unique field already exists in database
 * Should be treated as successful sync (don't retry)
 */
export function isDuplicateKeyError(error: any): boolean {
  if (!error) return false;

  // Check error message for E11000
  const errorMessage = error?.message?.toString().toLowerCase() || '';
  if (errorMessage.includes('e11000')) {
    return true;
  }

  // Check response data for E11000 error
  const responseData = error?.response?.data || {};
  const dataMessage = (responseData.message || '').toString().toLowerCase();
  if (dataMessage.includes('e11000')) {
    return true;
  }

  // Check nested error object
  if (error?.error?.includes?.('e11000')) {
    return true;
  }

  // Check error code (some APIs return error code)
  if (error?.code === 'E11000' || error?.code === 11000) {
    return true;
  }

  return false;
}
