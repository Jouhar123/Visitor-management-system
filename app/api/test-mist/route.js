// app/api/test-mist/route.js
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const SITE_ID = process.env.MISTSITEID;
    const WLAN_ID = process.env.WLANID;
    const MIST_TOKEN = process.env.MISTTOKEN;

    // Check if environment variables are set
    if (!SITE_ID || !WLAN_ID || !MIST_TOKEN) {
      return NextResponse.json({
        error: "Missing environment variables",
        hasSiteId: !!SITE_ID,
        hasWlanId: !!WLAN_ID,
        hasToken: !!MIST_TOKEN
      }, { status: 400 });
    }

    const results = [];

    // Test 1: Check if we can access the site
    try {
      const siteResponse = await fetch(`https://api.mist.com/api/v1/sites/${SITE_ID}`, {
        headers: {
          "Authorization": `Token ${MIST_TOKEN}`,
          "Content-Type": "application/json"
        }
      });

      results.push({
        test: "Site Access",
        endpoint: `/api/v1/sites/${SITE_ID}`,
        status: siteResponse.status,
        success: siteResponse.ok,
        data: siteResponse.ok ? "Site accessible" : await siteResponse.text()
      });
    } catch (error) {
      results.push({
        test: "Site Access",
        endpoint: `/api/v1/sites/${SITE_ID}`,
        error: error.message
      });
    }

    // Test 2: Check if we can access the WLAN
    try {
      const wlanResponse = await fetch(`https://api.mist.com/api/v1/sites/${SITE_ID}/wlans/${WLAN_ID}`, {
        headers: {
          "Authorization": `Token ${MIST_TOKEN}`,
          "Content-Type": "application/json"
        }
      });

      results.push({
        test: "WLAN Access",
        endpoint: `/api/v1/sites/${SITE_ID}/wlans/${WLAN_ID}`,
        status: wlanResponse.status,
        success: wlanResponse.ok,
        data: wlanResponse.ok ? "WLAN accessible" : await wlanResponse.text()
      });
    } catch (error) {
      results.push({
        test: "WLAN Access",
        endpoint: `/api/v1/sites/${SITE_ID}/wlans/${WLAN_ID}`,
        error: error.message
      });
    }

    // Test 3: Check for guest-related endpoints
    const guestEndpoints = [
      `/api/v1/sites/${SITE_ID}/wlans/${WLAN_ID}/guest_access`,
      `/api/v1/sites/${SITE_ID}/wlans/${WLAN_ID}/guests`,
      `/api/v1/sites/${SITE_ID}/guests`,
      `/api/v1/sites/${SITE_ID}/guest_access`
    ];

    for (const endpoint of guestEndpoints) {
      try {
        const response = await fetch(`https://api.mist.com${endpoint}`, {
          method: "GET", // Use GET to check if endpoint exists
          headers: {
            "Authorization": `Token ${MIST_TOKEN}`,
            "Content-Type": "application/json"
          }
        });

        results.push({
          test: "Guest Endpoint Check",
          endpoint: endpoint,
          status: response.status,
          success: response.status !== 404, // 404 means endpoint doesn't exist
          data: response.status === 404 ? "Endpoint not found" : "Endpoint exists"
        });
      } catch (error) {
        results.push({
          test: "Guest Endpoint Check",
          endpoint: endpoint,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      message: "Mist API connectivity test results",
      siteId: SITE_ID,
      wlanId: WLAN_ID,
      hasToken: !!MIST_TOKEN,
      results: results
    });

  } catch (error) {
    console.error("Error in test-mist API:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error.message
    }, { status: 500 });
  }
} 