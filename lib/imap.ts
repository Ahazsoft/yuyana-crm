//@ts-nocheck
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { prismadb } from "@/lib/prisma";

type StoredImap = {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  password?: string;
  mailbox?: string;
};

async function getConfigFromDb(userId?: string): Promise<StoredImap | null> {
  try {
    if (userId) {
      const account = await prismadb.emailAccount.findFirst({
        where: { user: userId },
      });

      if (account) {
        return {
          host: account.host || undefined,
          port: account.port || undefined,
          secure:
            typeof account.secure === "boolean" ? account.secure : undefined,
          user: account.email || undefined,
          password: account.password || undefined,
          mailbox: account.mailbox || undefined,
        };
      }
    }

    const rec = await prismadb.systemServices.findFirst({
      where: { name: "imap" },
    });

    if (!rec?.serviceKey) return null;

    try {
      return JSON.parse(rec.serviceKey);
    } catch (err) {
      return null;
    }
  } catch (err) {
    return null;
  }
}



export async function getImapConfig(userId?: string) {
  const db = await getConfigFromDb(userId);

  const config = {
    host: process.env.IMAP_HOST || db?.host || "mail.travelwithyuyana.com",
    port: process.env.IMAP_PORT
      ? Number(process.env.IMAP_PORT)
      : db?.port || 993,
    secure:
      typeof process.env.IMAP_SECURE !== "undefined"
        ? process.env.IMAP_SECURE === "true"
        : (db?.secure ?? true),
    user: process.env.IMAP_USER || db?.user || "test@travelwithyuyana.com",
    password: process.env.IMAP_PASSWORD || db?.password || "",
    mailbox: process.env.IMAP_MAILBOX || db?.mailbox || "INBOX",
    sentMailbox: process.env.IMAP_SENT_MAILBOX || db?.sentMailbox || "Sent",
  };

  if (!config.host || !config.user || !config.password) {
    throw new Error(
      "IMAP configuration missing. Set IMAP_HOST/IMAP_USER/IMAP_PASSWORD or add a systemServices record named 'imap'.",
    );
  }

  return config;
}

export type FetchedEmail = {
  id: string;
  subject?: string;
  from?: string;
  to?: string[];
  date?: string;
  text?: string;
  html?: string;
  attachments?: { filename?: string; contentType?: string; size?: number }[];
  seen?: boolean;
};

export type MailboxFetchResult = {
  INBOX: FetchedEmail[];
  SENT: FetchedEmail[];
};

export async function fetchRecentEmails({
  limit = 20,
  userId,
}: { limit?: number; userId?: string } = {}): Promise<MailboxFetchResult> {
  const cfg = await getImapConfig(userId);

  const client = new ImapFlow({
    host: cfg.host!,
    port: cfg.port!,
    secure: cfg.secure!,
    auth: {
      user: cfg.user!,
      pass: cfg.password!,
    },
    // Provide a no-op logger to suppress verbose IMAP/imapflow logs in production
    logger: {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    },
  });

  await client.connect();

  const inboxName = "INBOX";
  const sentName = "SENT";

  async function fetchMailbox(name: string) {
    try {
      await client.mailboxOpen(name);

      let uids = await client.search({});
      if (!uids || uids.length === 0) return [];
      uids = uids.slice(-limit);

      const results: FetchedEmail[] = [];

      // Request flags so we can detect Seen/Unread state for inbox messages
      for await (const msg of client.fetch(uids, {
        source: true,
        flags: true,
      })) {
        const parsed = await simpleParser(msg.source as NodeJS.ReadableStream);

        const seen = Array.isArray(msg.flags)
          ? msg.flags.includes("\\Seen") || msg.flags.includes("Seen")
          : false;

        results.push({
          id: String(
            msg.uid ??
              parsed.messageId ??
              parsed.date?.getTime() ??
              Math.random(),
          ),
          subject: parsed.subject,
          from: parsed.from?.text,
          to: parsed.to?.value.map((v) => v.address),
          date: parsed.date?.toISOString(),
          text: parsed.text,
          html: parsed.html,
          attachments: parsed.attachments?.map((a) => ({
            filename: a.filename,
            contentType: a.contentType,
            size: a.size,
          })),
          seen,
        });
      }

      return results.reverse();
    } catch (err) {
      return [];
    }
  }

  try {
    const inboxResults = await fetchMailbox('INBOX');
    const sentResults = await fetchMailbox('Sent');
  
    return {
      INBOX: inboxResults,
      SENT: sentResults,
    };
  } finally {
    try {
      await client.logout();
    } catch (e) {
      // ignore
    }
  }
}

export default { getImapConfig, fetchRecentEmails };


