"use client";

import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";

interface BrowserCompatibility {
  localStorage: boolean;
  json: boolean;
  fetch: boolean;
  crypto: boolean;
}

export function BrowserCompatibilityCheck() {
  const [compatibility, setCompatibility] =
    useState<BrowserCompatibility | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const compat = storage.getBrowserCompatibility();
    setCompatibility(compat);
  }, []);

  if (!compatibility) return null;

  const allCompatible =
    compatibility.localStorage &&
    compatibility.json &&
    compatibility.fetch &&
    compatibility.crypto;

  if (allCompatible && !showDetails) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div
        className={`p-3 rounded-lg shadow-lg border ${
          allCompatible
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                allCompatible ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm font-medium">
              {allCompatible ? "Browser Compatible" : "Browser Issues Detected"}
            </span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs underline hover:no-underline"
          >
            {showDetails ? "Hide" : "Details"}
          </button>
        </div>

        {showDetails && (
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={
                  compatibility.localStorage ? "text-green-600" : "text-red-600"
                }
              >
                {compatibility.localStorage ? "✓" : "✗"}
              </span>
              <span>localStorage</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={
                  compatibility.json ? "text-green-600" : "text-red-600"
                }
              >
                {compatibility.json ? "✓" : "✗"}
              </span>
              <span>JSON API</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={
                  compatibility.fetch ? "text-green-600" : "text-red-600"
                }
              >
                {compatibility.fetch ? "✓" : "✗"}
              </span>
              <span>Fetch API</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={
                  compatibility.crypto ? "text-green-600" : "text-red-600"
                }
              >
                {compatibility.crypto ? "✓" : "✗"}
              </span>
              <span>Web Crypto API</span>
            </div>
            {!allCompatible && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
                <strong>Recommendation:</strong> Try disabling browser
                extensions or using incognito mode. If issues persist, contact
                support.
                {!compatibility.crypto && (
                  <div className="mt-1">
                    <strong>Security Note:</strong> Web Crypto API not
                    supported. Data encryption features will be disabled for
                    security.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
