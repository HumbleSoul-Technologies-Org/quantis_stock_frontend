import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';
import { maintenanceStorage } from '@/lib/maintenanceStorage';

// This is a simple auth check - in production, use proper authentication
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.MAINTENANCE_API_KEY;

  if (!apiKey) {
    // If no API key is set, allow for development
    return true;
  }

  return authHeader === `Bearer ${apiKey}`;
}

export async function POST(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { type } = body;

    if (!type || !['start', 'complete'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type. Must be "start" or "complete"' },
        { status: 400 }
      );
    }

    const subscriberList = maintenanceStorage.getSubscribers();

    if (subscriberList.length === 0) {
      return NextResponse.json(
        { message: 'No subscribers to notify' },
        { status: 200 }
      );
    }

    let success = false;

    if (type === 'start') {
      success = await emailService.sendMaintenanceStartNotification(subscriberList);
    } else if (type === 'complete') {
      success = await emailService.sendMaintenanceCompleteNotification(subscriberList);
    }

    if (success) {
      return NextResponse.json(
        {
          message: `Maintenance ${type} notification sent to ${subscriberList.length} subscribers`,
          subscriberCount: subscriberList.length
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send notifications' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check subscriber count (for debugging)
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    subscriberCount: maintenanceStorage.getSubscriberCount(),
    subscribers: maintenanceStorage.getSubscribers()
  });
}