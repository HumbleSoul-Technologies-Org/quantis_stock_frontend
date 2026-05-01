/**
 * EncryptionErrorBoundary Component
 * Catches and handles encryption-related errors gracefully
 *
 * Features:
 * - Catches encryption failures
 * - Provides user-friendly error messages
 * - Offers recovery options
 * - Prevents app crashes from encryption issues
 */

"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
  isRecovering: boolean;
}

export class EncryptionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is an encryption-related error
    const isEncryptionError =
      error.message.includes("EncryptionService") ||
      error.message.includes("SubtleCrypto") ||
      error.message.includes("encryption") ||
      error.message.includes("CryptoKey");

    if (isEncryptionError) {
      console.error("[ENCRYPTION_BOUNDARY] Encryption error caught:", error);
      return {
        hasError: true,
        error,
        errorInfo: error.message,
        isRecovering: false,
      };
    }

    // Re-throw non-encryption errors
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ENCRYPTION_BOUNDARY] Error details:", error, errorInfo);
  }

  handleRecovery = async () => {
    this.setState({ isRecovering: true });

    try {
      // Clear encryption data and reload
      if (typeof window !== "undefined") {
        // Clear session storage
        sessionStorage.clear();

        // Clear encrypted localStorage keys
        const keysToClear = [
          "erp_user_session",
          "userData",
          "businessData",
          "businessSettings",
          "teamUsers",
        ];
        keysToClear.forEach((key) => localStorage.removeItem(key));

        console.log(
          "🔧 [ENCRYPTION_BOUNDARY] Cleared encryption data, reloading...",
        );

        // Reload the page to reinitialize everything
        window.location.reload();
      }
    } catch (error) {
      console.error("[ENCRYPTION_BOUNDARY] Recovery failed:", error);
      this.setState({
        isRecovering: false,
        error: error instanceof Error ? error : new Error("Recovery failed"),
      });
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="max-w-md w-full">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Encryption Error</AlertTitle>
              <AlertDescription className="text-red-700 mt-2">
                There was a problem with data encryption. This might affect your
                saved data.
                <br />
                <br />
                <strong>What happened:</strong> {this.state.errorInfo}
              </AlertDescription>
            </Alert>

            <div className="mt-6 space-y-3">
              <Button
                onClick={this.handleRecovery}
                disabled={this.state.isRecovering}
                className="w-full"
                variant="default"
              >
                {this.state.isRecovering ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Recovering...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Recover & Reload
                  </>
                )}
              </Button>

              <Button
                onClick={this.handleRetry}
                variant="outline"
                className="w-full"
                disabled={this.state.isRecovering}
              >
                Try Again
              </Button>
            </div>

            <div className="mt-4 text-sm text-gray-600 text-center">
              If this problem persists, try clearing your browser data or
              contact support.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
