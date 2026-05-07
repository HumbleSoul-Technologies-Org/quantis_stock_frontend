/**
 * Printing Sign Proxy
 * POST /api/printing/sign
 * Proxies to backend server for QZ Tray data signing
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get backend URL from environment or default to localhost:5353
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5353/api';

    // Get the request body
    const body = await request.json();
    const { toSign } = body;

    if (!toSign) {
      return NextResponse.json(
        { error: 'Missing toSign data in request body' },
        { status: 400 }
      );
    }

    // Get auth token from cookies or authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') ||
                  request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Proxy the request to backend
    const response = await fetch(`${backendUrl}/printing/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ toSign }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Signing failed' }));
      console.error('[PROXY] Signing failed:', response.status, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const signature = await response.text();

    return new NextResponse(signature, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('[PROXY] Sign proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}