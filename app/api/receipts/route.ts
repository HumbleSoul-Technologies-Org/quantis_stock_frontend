/**
 * Receipt API Proxy Routes
 * POST /api/receipts - Create receipt
 * GET /api/receipts - List receipts with pagination/filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export async function POST(request: NextRequest) {
  try {
    // Get backend URL from environment or default to localhost:5353
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5353';

    // Get the request body
    const body = await request.json();

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

    // Decode JWT to extract user ID
    let userId: string | undefined;
    try {
      const decoded = jwtDecode<{ id?: string; userId?: string; sub?: string }>(token);
      userId = decoded.id || decoded.userId || decoded.sub;
    } catch (error) {
      console.error('[PROXY] Failed to decode JWT:', error);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in token' },
        { status: 401 }
      );
    }

    // Add userId to request body
    const updatedBody = {
      ...body,
      userId,
    };

    const response = await fetch(`${backendUrl}/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Receipt creation failed' }));
      console.error('[PROXY] Receipt creation failed:', response.status, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[PROXY] Receipt creation proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get backend URL from environment or default to localhost:5353
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5353';

    // Get query parameters
    const url = new URL(request.url);
    const queryParams = url.searchParams.toString();
    const targetUrl = queryParams
      ? `${backendUrl}/receipts?${queryParams}`
      : `${backendUrl}/receipts`;

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
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Receipts list unavailable' }));
      console.error('[PROXY] Receipt list failed:', response.status, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[PROXY] Receipt list proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}