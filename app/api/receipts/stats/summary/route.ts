/**
 * Receipt Statistics Proxy
 * GET /api/receipts/stats/summary
 * Proxies to backend server for receipt analytics
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get backend URL from environment or default to localhost:5353
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5353';

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
    const response = await fetch(`${backendUrl}/receipts/stats/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Statistics unavailable' }));
      console.error('[PROXY] Receipt stats failed:', response.status, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[PROXY] Receipt stats proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}