# Resend Email Service Setup for StockOS Maintenance Notifications

This guide explains how to set up Resend email service for sending maintenance notifications in your StockOS application. The application uses Resend to notify subscribers when maintenance starts and completes.

## Prerequisites

- A Resend account (sign up at [resend.com](https://resend.com))
- A verified domain for sending emails
- Access to your project's environment variables

## Overview

StockOS uses the following components for email notifications:

- **Email Service**: Located in `lib/emailService.ts`, supports multiple providers (SendGrid, Resend, Console)
- **Maintenance Notifications**: API endpoints in `app/api/maintenance/notify/route.ts` for start/complete notifications
- **Subscriber Management**: Stored in `lib/maintenanceStorage.ts`
- **Configuration**: Environment variables in `.env` file

## Step-by-Step Setup

### Step 1: Sign Up for Resend

1. Go to [resend.com](https://resend.com) and create a new account
2. Complete the registration process and verify your email
3. Log in to your Resend dashboard

### Step 2: Verify Your Domain

Domain verification is required to send emails from your domain and improve deliverability.

1. In your Resend dashboard, navigate to **Domains** in the left sidebar
2. Click **Add Domain**
3. Enter your domain (e.g., `stockos.com` or `yourapp.com`)
4. Click **Add Domain**

Resend will provide DNS records that you need to add to your domain's DNS settings:

- **TXT Record**: For domain ownership verification
- **MX Records**: For email routing
- **DKIM Records**: For email authentication (typically 3 CNAME records)

5. Go to your domain registrar or DNS provider (e.g., GoDaddy, Namecheap, Cloudflare)
6. Add the provided DNS records:
   - TXT record for verification
   - MX records pointing to Resend's servers
   - DKIM CNAME records (usually `resend._domainkey.yourdomain.com`)

7. Return to Resend and click **Verify** for each record
8. Wait for all records to show as verified (this may take up to 24 hours)

**Note**: If you're using a subdomain (e.g., `noreply.stockos.com`), verify the root domain first, then add the subdomain.

### Step 3: Generate API Key

1. In your Resend dashboard, go to **API Keys** in the left sidebar
2. Click **Create API Key**
3. Give it a descriptive name (e.g., "StockOS Maintenance Notifications")
4. Select the appropriate permissions (typically "Sending access")
5. Click **Create**
6. **Important**: Copy the API key immediately - it won't be shown again!

### Step 4: Configure Environment Variables

Update your `.env.local` file (create one if it doesn't exist) with the following variables:

```env
# Email Configuration (for maintenance notifications)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=your_resend_api_key_here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=StockOS

# Maintenance API Key (for sending notifications)
MAINTENANCE_API_KEY=your_secure_maintenance_api_key

# App URL (for email links)
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

**Security Notes**:

- Never commit `.env.local` files to version control
- Use strong, unique API keys
- Rotate keys periodically
- Use environment-specific keys (dev/staging/prod)

### Step 5: Test the Setup

#### Option 1: Test via Test Email Endpoint (Recommended)

1. Start your development server:

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. Use curl or a tool like Postman to test the email endpoint:

   ```bash
   curl -X POST http://localhost:3000/api/test-email \
     -H "Content-Type: application/json" \
     -d '{"to": "your-email@example.com"}'
   ```

3. Check your email inbox for the test message
4. Verify the email is delivered and formatted correctly

#### Option 2: Test via Maintenance Notifications

1. Add subscribers via the maintenance page (`/maintenance`)
2. Send maintenance start notification:

   ```bash
   curl -X POST http://localhost:3000/api/maintenance/notify \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your_maintenance_api_key" \
     -d '{"type": "start"}'
   ```

3. Check the inbox for maintenance notifications

#### Option 3: Console Testing (Development)

If you want to test without sending real emails, set `EMAIL_PROVIDER=console` in your `.env.local` file. This will log email content to the console instead of sending.

## Troubleshooting

### Common Issues

**Emails not sending**:

- Check your API key is correct and has sending permissions
- Verify domain is fully verified in Resend
- Ensure environment variables are loaded (restart your server)
- Check that `EMAIL_FROM` uses your verified domain

**Domain verification failing**:

- Wait up to 24 hours for DNS propagation
- Double-check DNS records are added correctly
- Use tools like `dig` or `nslookup` to verify records: `dig yourdomain.com TXT`

**Authentication errors**:

- Confirm API key format (should start with `re_`)
- Check for extra spaces in environment variables
- Verify the key hasn't expired or been revoked

**Emails going to spam**:

- Ensure domain has proper SPF/DKIM/DMARC records
- Use a reputable domain
- Avoid spam trigger words in email content

### Debugging

1. Check server console logs for error messages
2. Use Resend's dashboard to view email delivery status and logs
3. Test with `EMAIL_PROVIDER=console` to verify email content generation
4. Verify subscriber list is populated via `/api/maintenance/notify` (GET request)

## Email Templates

The application includes pre-built HTML templates for:

- **Maintenance Start**: Notifies users of upcoming maintenance
- **Maintenance Complete**: Confirms system is back online

Templates are located in `lib/emailService.ts` and can be customized as needed.

## Security Considerations

- Store API keys securely (never in code)
- Use HTTPS for all email links
- Implement rate limiting on notification endpoints
- Regularly audit subscriber lists
- Use proper authentication for maintenance endpoints
- Monitor email delivery rates and bounce rates

## Production Deployment

When deploying to production:

1. Use production-specific API keys
2. Set `NEXT_PUBLIC_APP_URL` to your production domain
3. Configure proper domain verification for production domain
4. Set up monitoring for email delivery
5. Consider email analytics in Resend dashboard
6. Use environment-specific configurations

## API Endpoints

### Test Email Endpoint

- **POST** `/api/test-email`
- Request body: `{ "to": "email@example.com" }`
- Response: `{ "message": "Test email sent successfully" }`

### Maintenance Notifications

- **POST** `/api/maintenance/notify`
- Headers: `Authorization: Bearer YOUR_MAINTENANCE_API_KEY`
- Request body: `{ "type": "start" | "complete" }`

### Newsletter Subscription

- **POST** `/api/maintenance/subscribe`
- Request body: `{ "email": "user@example.com" }`

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Email Authentication Guide](https://resend.com/docs/concepts/email-authentication)
- [DNS and Email Best Practices](https://resend.com/docs/knowledge-base)
- [Resend Node.js SDK](https://github.com/resend/resend-node)

For support, contact the development team or refer to the main README.md.
