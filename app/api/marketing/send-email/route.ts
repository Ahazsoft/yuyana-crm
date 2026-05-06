//@ts-nocheck
import { NextResponse } from "next/server";
import resendHelper from "@/lib/resend";
import nodemailer from "nodemailer";
import imaps from "imap-simple";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Parse request body
    const body = await req.json();
    const { to, subject, html, text } = body;
    console.log("[send-email] payload:", { to, subject, html: !!html, text: !!text });

    // 2. Authenticate
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    console.log("[send-email] user:", session.user.id);

    // 3. Fetch the user's email account (only one expected)
    const account = await prismadb.emailAccount.findFirst({
      where: { user: session.user.id },
    });

    if (!account?.email) {
      return new NextResponse("No email account configured", { status: 400 });
    }
    console.log("[send-email] account:", { id: account.id, email: account.email });

    const fromAddress = account.email;

    // === Template replacement ===
    let processedHtml = html || text || "";
    // if request asks to skip template replacement (dynamic segment), do not replace
    if (!(body as any)?.skipTemplate) {
      if (processedHtml && processedHtml.includes("{{")) {
        processedHtml = await replaceTemplates(processedHtml, to);
      }
    }

    // 4. Attempt to send via Resend
    let resendFailed = false;
    let resendError: any = null;

    try {
      const resend = await resendHelper();
      const resendResult = await resend.emails.send({
        from: fromAddress,
        to,
        subject,
        html: processedHtml,
      });

      console.log("[send-email] resend response:", resendResult);

      const errorPayload = resendResult?.error ?? null;
      if (errorPayload) {
        resendFailed = true;
        resendError = errorPayload;
      } else {
        // Resend succeeded → save to Sent mailbox
        await saveSentCopy(account, {
          from: fromAddress,
          to,
          subject,
          html: processedHtml,
        }).catch((e) => console.error("[send-email] IMAP append error:", e));

        return NextResponse.json({ ok: true, via: "resend", result: resendResult });
      }
    } catch (err) {
      console.error("[send-email] resend threw:", err);
      resendFailed = true;
      resendError = err;
    }

    // 5. Fallback to Nodemailer if Resend failed with 401/400
    if (resendFailed) {
      console.log("[send-email] resend failed:", resendError);
      const statusCode = resendError?.statusCode ?? 500;

      if (statusCode === 401 || statusCode === 400 || statusCode === 403) {
        console.log("[send-email] falling back to Nodemailer (status:", statusCode, ")");

        if (!account.host) {
          return new NextResponse(
            "SMTP host is missing in email account – cannot send via fallback",
            { status: 500 },
          );
        }

        const smtpPort = Number(process.env.SMTP_PORT) || 587;
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
            from: fromAddress,
            to,
            subject,
            html: processedHtml,
            text: text || undefined,
          });

          console.log("[send-email] nodemailer success:", {
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
          });

          // Save to Sent mailbox
          await saveSentCopy(account, {
            from: fromAddress,
            to,
            subject,
            html: processedHtml,
          }).catch((e) => console.error("[send-email] IMAP append error:", e));

          return NextResponse.json({
            ok: true,
            via: "nodemailer",
            info: {
              messageId: info.messageId,
              accepted: info.accepted,
              rejected: info.rejected,
            },
          });
        } catch (smtpErr) {
          console.error("[send-email] nodemailer failed:", smtpErr);
          return new NextResponse(
            `Resend returned ${statusCode}, and Nodemailer also failed: ${smtpErr instanceof Error ? smtpErr.message : String(smtpErr)}`,
            { status: 500 },
          );
        }
      }

      return new NextResponse(
        resendError?.message || "Resend error",
        { status: statusCode || 500 },
      );
    }

    return new NextResponse("Unexpected error", { status: 500 });
  } catch (err) {
    console.error("[send-email] unexpected:", err);
    return new NextResponse(
      err instanceof Error ? err.message : "Internal Server Error",
      { status: 500 },
    );
  }
}

// ====================== Helper: template replacement ======================
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

// ====================== Helper: IMAP append ======================
async function saveSentCopy(
  account: any, // EmailAccount from DB
  emailData: { from: string; to: string; subject: string; html: string }
) {
  // Build the raw MIME message (exactly what the recipient received)
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

  // Connect to IMAP using the same credentials and host as SMTP
  const config = {
    imap: {
      user: account.email,
      password: account.password!,
      host: account.host!,            // e.g., mail.travelwithyuyana.com
      port: 993,                      // IMAP SSL port (adjust if different)
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    },
  };

  const connection = await imaps.connect(config);
  await connection.openBox("INBOX.Sent");
  await connection.append(rawMessage, {
    mailbox: "INBOX.Sent",
  });
  await connection.end();

  console.log("[send-email] copy saved to Sent folder via IMAP");
}