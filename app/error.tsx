"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error in app:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-lg border border-red-200 p-8">
        <h1 className="text-2xl font-bold text-red-700 mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-700 mb-6">
          An unexpected error occurred. Please refresh the page or try again.
        </p>
        <pre className="text-xs text-slate-500 bg-gray-100 rounded p-3 overflow-x-auto mb-4">
          {error?.message}
        </pre>
        <div className="flex gap-2">
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={() => reset()}
          >
            Retry
          </button>
          <Link
            href="/"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
