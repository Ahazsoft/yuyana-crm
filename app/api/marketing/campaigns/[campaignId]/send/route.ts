//@ts-nocheck
import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import resendHelper from "@/lib/resend";
import nodemailer from "nodemailer";
import imaps from "imap-simple";
import sendEmail from "@/lib/sendmail";

// Tiptap imports for converting JSON → HTML
import { generateHTML } from "@tiptap/html";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import HardBreak from "@tiptap/extension-hard-break";
import ImageExtension from "@tiptap/extension-image";

// ------- Helper: build query from lead filters -------
function addCampaignTrackingToHtml(html: string, campaignId: string, recipient: string, baseUrl: string): string {
  const trackingUrl = `${baseUrl}/api/marketing/campaigns/${campaignId}/track?recipient=${encodeURIComponent(recipient)}`;
  const pixel = `<img src="${trackingUrl}" width="1" height="1" alt="" style="display:none;border:0;" />`;
  const unsubscribeUrl = `${baseUrl}/api/marketing/campaigns/${campaignId}/unsubscribe?recipient=${encodeURIComponent(recipient)}`;

  const bodyHtml = `
    <html>
      <body style="margin:0;padding:0;background-color:#f5f7fb;font-family:Arial,sans-serif;color:#111827;">
        <div style="max-width:640px;margin:0 auto;padding:24px;">
          <div style="background:#ffffff;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            ${html}
          </div>
          <div style="margin-top:12px;font-size:12px;color:#6b7280;text-align:center;">
            <a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
          </div>
        </div>        
      </body>
    </html>
  `;

  return bodyHtml;
}

async function buildLeadWhereFromFilters(filters: any[]): Promise<any> {
  const where: any = {};
  if (!Array.isArray(filters)) return where;
  for (const rule of filters) {
    const { field, operator, value } = rule as any;
    if (!field) continue;
    if (field === "status" && operator === "equals") where.status = value;
    if (field === "createdAt" && operator === "between" && Array.isArray(value) && value.length === 2) {
      where.createdAt = { gte: new Date(value[0]), lte: new Date(value[1]) };
    }
  }
  return where;
}

// ------- Helper: replace template placeholders -------
async function replaceTemplates(
  body: string,
  recipientEmail: string
): Promise<string> {
  const regex = /\{\{([a-zA-Z_]+)\.([a-zA-Z_]+)\}\}/g;
  const matches = Array.from(body.matchAll(regex));
  let result = body;

  for (const match of matches) {
    const [fullMatch, table, attribute] = match;
    if (table === "crm_Contacts") {
      const contact = await prismadb.crm_Contacts.findFirst({
        where: {
          OR: [
            { email: recipientEmail },
            { personal_email: recipientEmail },
          ],
        },
      });

      let replacement = "";
      if (contact) {
        const value = (contact as any)[attribute];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            replacement = value.join(", ");
          } else {
            replacement = String(value);
          }
        }
      }
      result = result.replace(fullMatch, replacement);
    }
  }

  return result;
}

// ------- Helper: save copy to Sent folder via IMAP -------
async function saveSentCopy(
  account: any,
  emailData: { from: string; to: string; subject: string; html: string }
) {
  try {
    const rawMessage = [
      `From: ${emailData.from}`,
      `To: ${emailData.to}`,
      `Subject: ${emailData.subject}`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset="UTF-8"`,
      ``,
      emailData.html,
    ].join("\r\n");

    const config = {
      imap: {
        user: account.email,
        password: account.password!,
        host: account.host!,
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
      },
    };

    const connection = await imaps.connect(config);
    await connection.openBox("INBOX.Sent");
    await connection.append(rawMessage, { mailbox: "INBOX.Sent" });
    await connection.end();
  } catch (err) {
    // IMAP failure is non‑critical, already handled by caller
  }
}

// ------- Helper: convert Tiptap JSON to HTML -------
function tiptapJsonToHtml(json: any): string {
  if (json && json.type === "doc" && Array.isArray(json.content)) {
    try {
      const extensions = [
        Document,
        Paragraph,
        Text,
        Bold,
        Italic,
        Underline,
        Heading,
        BulletList,
        ListItem,
        HardBreak,
        ImageExtension,
      ];
      return generateHTML(json, extensions);
    } catch (e) {
      // fallback as stringified JSON
    }
  }
  return JSON.stringify(json);
}

// ------- Main POST handler -------
export async function POST(
  req: Request,
  props: { params: Promise<{ campaignId: string }> }
) {
  const params = await props.params;
  const { campaignId } = params;

  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Get the user's email account
    const account = await prismadb.emailAccount.findFirst({
      where: { user: session.user.id },
    });
    if (!account?.email) {
      return new NextResponse("No email account configured", { status: 400 });
    }

    const fromAddress = account.email;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;

    // 3. Parse request body
    const body = await req.json();
    const { subject, body: htmlBody, to } = body;

    // 4. Fetch campaign & segment, determine recipients
    const campaign = await prismadb.crm_marketing_campaigns.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      return new NextResponse("Campaign not found", { status: 404 });
    }

    const targetSegmentId = to || campaign.targetAudience || null;
    if (!targetSegmentId) {
      return new NextResponse("No target segment specified", { status: 400 });
    }

    const seg = await prismadb.marketingSegment.findUnique({
      where: { id: targetSegmentId },
      include: { members: { include: { lead: true } } },
    });
    if (!seg) {
      return new NextResponse("Segment not found", { status: 404 });
    }

    let recipients: string[] = [];

    if ((seg as any).type === "DYNAMIC") {
      const arr = Array.isArray((seg as any).emails) ? (seg as any).emails : [];
      recipients = arr.map((e: any) => (e || "").trim().toLowerCase()).filter(Boolean);
    } else {
      if (seg.members && seg.members.length > 0) {
        recipients = seg.members.map((m: any) => m.lead?.email).filter(Boolean);
      } else if ((seg as any).leadFilters) {
        const where = await buildLeadWhereFromFilters((seg as any).leadFilters || []);
        const leads = await prismadb.crm_Leads.findMany({ where, take: 1000 });
        recipients = leads.map((l: any) => l.email).filter(Boolean);
      } else {
        return new NextResponse("No recipients found for STATIC segment", { status: 400 });
      }
    }

    // Deduplicate
    recipients = Array.from(new Set(recipients.map((r) => r.toLowerCase())));
    if (recipients.length === 0) {
      return new NextResponse("No recipient emails", { status: 400 });
    }

    // 5. Send to each recipient inline (Resend first, Nodemailer fallback)
    const results: any[] = [];
    const failedRecipients: Array<{ email: string; error: string }> = [];
    const isDynamic = (seg as any).type === "DYNAMIC";
    const baseUrl = new URL(req.url).origin;

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];

      let processedHtml = htmlBody || campaign.emailContent || "";

      if (typeof processedHtml !== "string") {
        processedHtml = tiptapJsonToHtml(processedHtml);
      }

      // Template replacement for non‑dynamic segments
      if (!isDynamic && processedHtml && processedHtml.includes("{{")) {
        processedHtml = await replaceTemplates(processedHtml, recipient);
      }

      const trackedHtml = addCampaignTrackingToHtml(processedHtml, campaignId, recipient, baseUrl);

      const emailPayload = {
        from: fromAddress,
        to: recipient,
        subject: subject || campaign.emailSubject,
        html: trackedHtml,
        headers: {
          "List-Unsubscribe": `<${baseUrl}/api/marketing/campaigns/${campaignId}/unsubscribe?recipient=${encodeURIComponent(recipient)}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      };

      let sent = false;
      let via = null;
      let errorDetail = null;

      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      // --- Try Resend ---
      try {
        const resend = await resendHelper();
        const resendResult = await resend.emails.send(emailPayload);

        const errorPayload = resendResult?.error ?? null;
        if (errorPayload) {
          throw errorPayload;
        }

        sent = true;
        via = "resend";

        // Save to Sent (non‑blocking)
        saveSentCopy(account, {
          from: fromAddress,
          to: recipient,
          subject: emailPayload.subject,
          html: processedHtml,
        }).catch(() => {});
      } catch (resendError: any) {
        const statusCode = resendError?.statusCode ?? 500;

        //  Only log: Resend failure with useful details
        console.error(`[campaign-send] Resend FAIL (${statusCode}) for ${recipient}: ${resendError?.message || "unknown error"}`);

        if (statusCode === 401 || statusCode === 400 || statusCode === 403) {
          if (!account.host) {
            errorDetail = "SMTP host missing";
          } else {
            const transporter = nodemailer.createTransport({
              host: account.host,
              port: smtpPort,
              secure: false,
              auth: {
                user: account.email,
                pass: account.password ?? "",
              },
            });

            try {
              const info = await transporter.sendMail({
                from: emailPayload.from,
                to: emailPayload.to,
                subject: emailPayload.subject,
                html: emailPayload.html,
              });
              sent = true;
              via = "nodemailer";

              saveSentCopy(account, {
                from: fromAddress,
                to: recipient,
                subject: emailPayload.subject,
                html: processedHtml,
              }).catch(() => {});
            } catch (smtpErr: any) {
              errorDetail = `Nodemailer also failed: ${smtpErr?.message || String(smtpErr)}`;
            }
          }
        } else {
          errorDetail = resendError?.message || "Resend error";
        }
      }

      results.push({
        recipient,
        status: sent ? "sent" : "failed",
        via: via || undefined,
        error: errorDetail || undefined,
      });

      if (!sent) {
        failedRecipients.push({
          email: recipient,
          error: errorDetail || "Unknown error",
        });
      }
    }

    // 6. Update campaign sentCount
    const successfulCount = results.filter((r) => r.status === "sent").length;

    try {
      const admins = await prismadb.users.findMany({ where: { is_admin: true } });
      const failedPayload = JSON.stringify({
        campaignId,
        campaignName: campaign.name,
        failedRecipients,
        sentAt: new Date().toISOString(),
      }, null, 2);

      await Promise.all(
        admins.map((admin) =>
          sendEmail({
            from: process.env.EMAIL_FROM || fromAddress,
            to: admin.email,
            subject: `[Marketing] Campaign send failed recipients for ${campaign.name}`,
            text: `Campaign send finished.\n\nFailed recipients:\n${failedPayload}`,
          }),
        ),
      );
    } catch (adminMailError) {
      console.error("Failed to notify admins about campaign failures", adminMailError);
    }

    try {
      await prismadb.crm_marketing_campaigns.update({
        where: { id: campaignId },
        data: {
          sentCount: { increment: successfulCount },
          updatedAt: new Date(),
        },
      });
    } catch (e) {
      // silently ignore, sentCount update is non‑critical
    }

    return NextResponse.json({
      ok: true,
      totalRecipients: recipients.length,
      successful: successfulCount,
      failed: results.length - successfulCount,
      results,
    });
  } catch (err) {
    console.error("[CAMPAIGN_SEND_ERR]", err);
    return new NextResponse(
      err instanceof Error ? err.message : "Error",
      { status: 500 }
    );
  }
}