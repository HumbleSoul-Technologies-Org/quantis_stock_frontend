/**
 * Printing Certificate Proxy
 * GET /api/printing/certificate
 * Proxies to backend server for QZ Tray certificate retrieval
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get backend URL from environment or default to localhost:5353
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5353/api';

    const response = await fetch(`${backendUrl}/printing/certificate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[PROXY] Certificate fetch failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Certificate service unavailable' },
        { status: response.status }
      );
    }

    const certificate = await response.text();

    return new NextResponse(certificate, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('[PROXY] Certificate proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}