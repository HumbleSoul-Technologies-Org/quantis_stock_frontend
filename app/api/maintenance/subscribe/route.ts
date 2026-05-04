import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { maintenanceStorage } from '@/lib/maintenanceStorage';

// Newsletter subscription schema
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = subscribeSchema.parse(body);

    // Check if already subscribed
    if (maintenanceStorage.isSubscribed(email)) {
      return NextResponse.json(
        { message: 'Already subscribed' },
        { status: 200 }
      );
    }

    // Add to subscribers
    const added = maintenanceStorage.addSubscriber(email);

    if (!added) {
      return NextResponse.json(
        { message: 'Already subscribed' },
        { status: 200 }
      );
    }

    // In a real implementation, you would:
    // 1. Store in database
    // 2. Send confirmation email
    // 3. Handle duplicates properly

    console.log(`New maintenance subscriber: ${email}`);

    return NextResponse.json(
      { message: 'Successfully subscribed to maintenance notifications' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check subscription status (for debugging)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter required' },
      { status: 400 }
    );
  }

  const isSubscribed = maintenanceStorage.isSubscribed(email);
  return NextResponse.json({ subscribed: isSubscribed });
}