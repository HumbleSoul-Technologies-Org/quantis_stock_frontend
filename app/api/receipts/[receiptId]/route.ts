/**
 * Receipt Detail Proxy
 * GET /api/receipts/[receiptId]
 * Proxies to backend server for individual receipt retrieval
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ receiptId: string }> }
) {
  try {
    // Get backend URL from environment or default to localhost:5353
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5353';

    const { receiptId } = await params;

    if (!receiptId) {
      return NextResponse.json(
        { error: 'Receipt ID is required' },
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
    const response = await fetch(`${backendUrl}/receipts/${receiptId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Receipt not found' }));
      console.error('[PROXY] Receipt detail failed:', response.status, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[PROXY] Receipt detail proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}