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
