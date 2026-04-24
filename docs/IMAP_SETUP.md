IMAP Integration Setup
=====================

Overview
--------
This project includes an IMAP helper (`lib/imap.ts`) and a simple authenticated API route at `/api/imap/fetch` to retrieve recent messages from a configured IMAP mailbox.

Configuration options
---------------------
You may provide IMAP credentials either via environment variables or by creating a `systemServices` record in the database with `name: "imap"` and `serviceKey` set to a JSON string with the keys below.

Environment variables (preferred for initial setup):

- `IMAP_HOST` — IMAP server hostname (e.g. `imap.gmail.com`)
- `IMAP_PORT` — IMAP server port (default `993`)
- `IMAP_SECURE` — `true`/`false` (default `true`)
- `IMAP_USER` — IMAP username (full email address)
- `IMAP_PASSWORD` — IMAP password or app-specific password
- `IMAP_MAILBOX` — mailbox folder to read (`INBOX` by default)

Alternative: store JSON in DB (Admin panel will need to expose this). Example `serviceKey` value:

```
{
  "host": "imap.example.com",
  "port": 993,
  "secure": true,
  "user": "you@example.com",
  "password": "your-password",
  "mailbox": "INBOX"
}
```

Install runtime dependencies
----------------------------
The helper uses `imapflow` and `mailparser` to connect and parse messages. Install them with:

```bash
pnpm add imapflow mailparser
```

Usage
-----
- API route (requires authentication): `GET /api/imap/fetch?limit=20` — returns recent emails as JSON.
- The helper also exposes `fetchRecentEmails()` in `lib/imap.ts` for server-side use.

Next steps (recommended)
------------------------
- Persist fetched messages into a DB table and create a server action to periodically poll or process webhooks.
- Replace the static `app/[locale]/(routes)/marketing/emails/data.tsx` dataset with a server-side fetch to `/api/imap/fetch` and wire the UI to live data.
- Add an admin UI to manage IMAP credentials securely (similar to `ResendCard` for Resend API key).
