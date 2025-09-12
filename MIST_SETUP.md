# Juniper Mist Guest Access Setup Guide

This guide will help you set up the Juniper Mist integration for guest WiFi access in your visitor management system.

## Prerequisites

1. A Juniper Mist account with API access
2. A configured site and WLAN in your Mist dashboard
3. API token with appropriate permissions

## Step 1: Get Your Mist Credentials

### 1.1 Get Site ID
1. Log into your Mist dashboard
2. Navigate to **Sites** in the left sidebar
3. Select your site
4. Copy the Site ID from the URL or site details

### 1.2 Get WLAN ID
1. In your Mist dashboard, go to **WLANs**
2. Select the WLAN you want to use for guest access
3. Copy the WLAN ID from the URL or WLAN details

### 1.3 Generate API Token
1. Go to **Organization** → **Settings** → **API Tokens**
2. Click **Add Token**
3. Give it a name (e.g., "Visitor Management")
4. Select appropriate permissions (at minimum: `sites:read`, `wlans:read`, `wlans:write`)
5. Copy the generated token

## Step 2: Configure Environment Variables

1. Create a `.env.local` file in your project root
2. Add the following variables:

```env
# Juniper Mist API Configuration
MISTSITEID=your_site_id_here
WLANID=your_wlan_id_here
MISTTOKEN=your_api_token_here
```

Replace the placeholder values with your actual credentials.

## Step 3: Test Your Configuration

1. Start your development server: `npm run dev`
2. Visit `/api/test-mist` in your browser to test your Mist configuration
3. This will check:
   - If your environment variables are set correctly
   - If you can access your site
   - If you can access your WLAN
   - Which guest endpoints are available

## Step 4: Test the Guest Registration

1. Navigate to `/visitor-reg` in your browser
2. Fill out the guest registration form
3. Submit and check the console for any errors

## Troubleshooting

### Common Issues

1. **"Missing Mist environment variables"**
   - Check that all environment variables are set correctly
   - Restart your development server after adding environment variables

2. **"Not Found" errors**
   - The API endpoint structure might be different for your Mist version
   - Use the `/api/test-mist` endpoint to find the correct endpoints
   - Check the console logs for which endpoints are being tried

3. **"Failed to submit guest request to Mist"**
   - Verify your API token has the correct permissions
   - Check that your Site ID and WLAN ID are correct
   - Ensure the WLAN is configured for guest access

4. **"Invalid response from Mist API"**
   - Check the Mist API documentation for the correct endpoint format
   - Verify your Mist account has the necessary features enabled

### Debug Information

The API will log detailed information to help with debugging:
- Request payload (with sensitive data masked)
- Response status and data
- Error details from Mist API
- Which endpoints are being tried

### Using the Test Endpoint

Visit `/api/test-mist` to get detailed information about:
- Your environment variable configuration
- Site and WLAN accessibility
- Available guest endpoints
- API token validity

## API Endpoint Details

The integration tries multiple possible Mist API endpoints:
```
POST https://api.mist.com/api/v1/sites/{SITE_ID}/wlans/{WLAN_ID}/guest_access
POST https://api.mist.com/api/v1/sites/{SITE_ID}/wlans/{WLAN_ID}/guests
POST https://api.mist.com/api/v1/sites/{SITE_ID}/guests
POST https://api.mist.com/api/v1/sites/{SITE_ID}/guest_access
```

### Request Payload
```json
{
  "guest_name": "Visitor Name",
  "guest_email": "visitor@example.com",
  "sponsor_email": "sponsor@company.com",
  "guest_mac": "00:11:22:33:44:55", // Optional
  "duration": 60 // Minutes
}
```

## Alternative Mist API Endpoints

If the standard endpoints don't work, try these alternatives based on your Mist version:

### For newer Mist versions:
```
POST https://api.mist.com/api/v1/sites/{SITE_ID}/guests
```

### For older Mist versions:
```
POST https://api.mist.com/api/v1/sites/{SITE_ID}/wlans/{WLAN_ID}/guest_access
```

## Security Notes

- Never commit your `.env.local` file to version control
- Use environment-specific tokens for different deployments
- Regularly rotate your API tokens
- Monitor API usage in your Mist dashboard

## Support

If you encounter issues:
1. Use `/api/test-mist` to diagnose configuration problems
2. Check the browser console for error messages
3. Verify your Mist credentials are correct
4. Test the API endpoint directly using a tool like Postman
5. Check the Mist API documentation for any changes
6. Contact Mist support if the endpoints are still not working 