//@ts-nocheck
import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Generates a cPanel-compliant strong password.
 */
function generateRandomPassword(length = 16) {
  return crypto.randomBytes(length)
    .toString('base64')
    .slice(0, length)
    .replace(/[/+=]/g, 'a') 
    .concat('!1A');
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // --- Configuration ---
    const domain = 'contacts.travelwithyuyana.com';
    const password = generateRandomPassword();
    
    const CPANEL_USERNAME = process.env.CPANEL_USERNAME;
    const CPANEL_API_TOKEN = process.env.CPANEL_API_TOKEN;
    
    // Using your specific format: "travelwithyuyana.com:2083/"
    const CPANEL_HOST = process.env.CPANEL_HOST;

    if (!CPANEL_USERNAME || !CPANEL_API_TOKEN || !CPANEL_HOST) {
      return NextResponse.json({ error: 'Missing cPanel environment variables' }, { status: 500 });
    }

    // Assemble URL using your specific CPANEL_HOST string
    // We remove any leading slash from the path since your host includes a trailing one
    const url = `https://${CPANEL_HOST}execute/Email/add_pop`;

    const params = new URLSearchParams({
      email: name,
      domain: domain,
      password: password,
      quota: '0', // 0 or "unlimited" provides unlimited disk space
      skip_update_db: '0'
    });

    // --- Execute UAPI Call ---
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET', 
      headers: {
        'Authorization': `cpanel ${CPANEL_USERNAME}:${CPANEL_API_TOKEN}`,
      },
    });

    const responseText = await response.text();

    // Check for login page redirects (HTML instead of JSON)
    if (responseText.trim().startsWith('<!DOCTYPE html>')) {
      return NextResponse.json({
        error: "Authentication failed. The server redirected to the login page.",
        details: "Ensure your API Token has the 'Email' scope enabled."
      }, { status: 401 });
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json({ error: "Invalid response from server" }, { status: 500 });
    }

    // UAPI standard error checking
    if (result.status === 0 || (result.errors && result.errors.length > 0)) {
      return NextResponse.json({ 
        error: result.errors?.[0] || 'Unknown cPanel error' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      email: `${name}@${domain}`,
      password: password,
      mailServerHost: `mail.${domain}`,
      webmailUrl: `https://${domain}/webmail`
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}