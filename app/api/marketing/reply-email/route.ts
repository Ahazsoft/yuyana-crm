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
    const body = await req.json();
    const { to, subject, html, text, originalMessageId, references } = body;

    // Basic validation
    if (!to || !originalMessageId) {
      return NextResponse.json(
        { error: "Missing required fields: to, originalMessageId" },
        { status: 400 }
      );
    }

    // Authenticate
    const session = await getServerSession(authOptions );
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch user's email account
    const account = await prismadb.emailAccount.findFirst({
      where: { user: session.user.id },
    });

    if (!account?.email) {
      return new NextResponse("No email account configured", { status: 400 });
    }

    const fromAddress = account.email;
    const replySubject = subject && !subject.startsWith("Re:") ? `Re: ${subject}` : subject;

    // Build the correct References header
    const refs = references
      ? `${references} ${originalMessageId}`
      : originalMessageId;

    // Prepare content – plain html or text
    const emailHtml = html || text || ""; // we send HTML only (no template)

    // --- Send via Resend first ---
    let resendFailed = false;
    let resendError: any = null;

    try {
      const resend = await resendHelper();
      const resendResult = await resend.emails.send({
        from: fromAddress,
        to,
        subject: replySubject,
        html: emailHtml,
        headers: {
          "In-Reply-To": originalMessageId,
          "References": refs,
        },
      });

      if (resendResult?.error) {
        resendFailed = true;
        resendError = resendResult.error;
      } else {
        // Save to Sent via IMAP
        await saveSentCopy(account, {
          from: fromAddress,
          to,
          subject: replySubject,
          html: emailHtml,
        }).catch((e) => console.error("[reply-email] IMAP append error:", e));

        return NextResponse.json({ ok: true, via: "resend", result: resendResult });
      }
    } catch (err) {
      console.error("[reply-email] resend threw:", err);
      resendFailed = true;
      resendError = err;
    }

    // --- Fallback to Nodemailer if Resend failed ---
    if (resendFailed) {
      console.log("[reply-email] resend failed:", resendError);
      const statusCode = resendError?.statusCode ?? 500;

      if (statusCode === 401 || statusCode === 400 || statusCode === 403) {
        console.log("[reply-email] falling back to Nodemailer (status:", statusCode, ")");

        if (!account.host) {
          return new NextResponse(
            "SMTP host is missing – cannot send via fallback",
            { status: 500 }
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
            subject: replySubject,
            html: emailHtml,
            text: text || undefined,
            inReplyTo: originalMessageId,   // sets In-Reply-To
            references: refs,               // sets References
          });

          await saveSentCopy(account, {
            from: fromAddress,
            to,
            subject: replySubject,
            html: emailHtml,
          }).catch((e) => console.error("[reply-email] IMAP append error:", e));

          return NextResponse.json({
            ok: true,
            via: "nodemailer",
            info: { messageId: info.messageId },
          });
        } catch (smtpErr) {
          console.error("[reply-email] nodemailer failed:", smtpErr);
          return new NextResponse(
            `Resend returned ${statusCode}, and Nodemailer also failed`,
            { status: 500 }
          );
        }
      }

      return new NextResponse(
        resendError?.message || "Resend error",
        { status: statusCode || 500 }
      );
    }

    return new NextResponse("Unexpected error", { status: 500 });
  } catch (err) {
    console.error("[reply-email] unexpected:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// ---------- Helper: IMAP append (same as your send-email) ----------
async function saveSentCopy(
  account: any,
  emailData: { from: string; to: string; subject: string; html: string }
) {
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
}