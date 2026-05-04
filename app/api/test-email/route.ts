import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';

// Simple auth check - in production, use proper authentication
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
    const { to } = body;

    if (!to || typeof to !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "to" email address in request body' },
        { status: 400 }
      );
    }

    // Send test email
    const success = await emailService.sendEmail({
      to,
      subject: 'Test Email from StockOS',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #059669;">StockOS Email Integration Test</h1>
              <p>This is a test email to verify that the Resend email integration is working correctly.</p>
              <p>If you received this email, the integration is functioning properly!</p>
              <p>Sent at: ${new Date().toISOString()}</p>
              <p>Best regards,<br>The StockOS Team</p>
            </div>
          </body>
        </html>
      `,
      text: `
        StockOS Email Integration Test

        This is a test email to verify that the Resend email integration is working correctly.

        If you received this email, the integration is functioning properly!

        Sent at: ${new Date().toISOString()}

        Best regards,
        The StockOS Team
      `,
    });

    if (success) {
      return NextResponse.json(
        { message: 'Test email sent successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in test-email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}