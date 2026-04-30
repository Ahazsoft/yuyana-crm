//@ts-nocheck
import { NextResponse } from "next/server";
import resendHelper from "@/lib/resend";
import nodemailer from "nodemailer";
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

    // 4. Attempt to send via Resend
    let resendFailed = false;
    let resendError: any = null;

    try {
      const resend = await resendHelper();
      const resendResult = await resend.emails.send({
        from: fromAddress,
        to,
        subject,
        html: html || text || "",
      });

      console.log("[send-email] resend response:", resendResult);

      // Check if Resend returned an error in the payload
      const errorPayload = resendResult?.error ?? null;
      if (errorPayload) {
        resendFailed = true;
        resendError = errorPayload;
      } else {
        // Resend succeeded
        return NextResponse.json({ ok: true, via: "resend", result: resendResult });
      }
    } catch (err) {
      // Resend threw an exception (network error, etc.)
      console.error("[send-email] resend threw:", err);
      resendFailed = true;
      resendError = err;
    }

    // 5. If Resend failed, decide whether to fallback to Nodemailer
    if (resendFailed) {
      console.log("[send-email] resend failed:", resendError);

      const statusCode = resendError?.statusCode ?? 500; // default to 500 if unknown

      // Fallback only for 401 or 400 errors (not 5xx)
      if (statusCode === 401 || statusCode === 400) {
        console.log("[send-email] falling back to Nodemailer (status:", statusCode, ")");

        // Check that we have the necessary SMTP host
        if (!account.host) {
          return new NextResponse(
            "SMTP host is missing in email account – cannot send via fallback",
            { status: 500 },
          );
        }

        // Build Nodemailer transporter using DB credentials + SMTP_PORT from env
        const smtpPort = Number(process.env.SMTP_PORT) || 587;
        const transporter = nodemailer.createTransport({
          host: account.host,
          port: smtpPort,
          secure: false, // use the account's secure setting or default false
          auth: {
            user: account.email,
            pass: account.password ?? "",  // password can be null
          },
        });

        try {
          const info = await transporter.sendMail({
            from: fromAddress,
            to,
            subject,
            html: html || text || "",
            text: text || undefined,
          });

          console.log("[send-email] nodemailer success:", {
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
          });

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

      // If Resend error was not 401/400, surface it directly
      return new NextResponse(
        resendError?.message || "Resend error",
        { status: statusCode || 500 },
      );
    }

    // This line should never be reached
    return new NextResponse("Unexpected error", { status: 500 });
  } catch (err) {
    console.error("[send-email] unexpected:", err);
    return new NextResponse(
      err instanceof Error ? err.message : "Internal Server Error",
      { status: 500 },
    );
  }
}