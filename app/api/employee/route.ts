// app/api/employee/route.ts
//@ts-nocheck
import { NextResponse } from "next/server";
import { prismadb as prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import resendHelper from "@/lib/resend";
import nodemailer from "nodemailer";

// Updated schema with personalEmail
const EmployeeSchema = z.object({
    name: z.string().min(2),
    username: z.string().min(2).regex(/^[a-z0-9_]+$/),
    email: z.string().email(),
    role: z.enum(["ADMIN", "SALES", "MARKETING"]),
    phone: z.string().nullable().optional(),
    personalEmail: z.string().email().nullable().optional(),
});

function generateRandomPassword(length = 16) {
    return crypto
        .randomBytes(length)
        .toString("base64")
        .slice(0, length)
        .replace(/[/+=]/g, "a")
        .concat("!1A");
}

// --- Email sending helpers ---
async function sendCredentialsEmail({
    from,
    to,
    subject,
    html,
    smtpAccount, // fallback SMTP details
}: {
    from: string;
    to: string;
    subject: string;
    html: string;
    smtpAccount: { host: string; email: string; password: string; port?: number };
}) {
    // Try Resend first
    try {
        const resend = await resendHelper();
        const result = await resend.emails.send({ from, to, subject, html });
        if (!result?.error) {
            console.log("[employee] credentials sent via Resend");
            return { via: "resend" };
        }
        console.log("[employee] Resend error:", result.error);
    } catch (err) {
        console.error("[employee] Resend threw:", err);
    }

    // Fallback to Nodemailer
    console.log("[employee] falling back to Nodemailer");
    const transporter = nodemailer.createTransport({
        host: smtpAccount.host,
        port: smtpAccount.port || 587,
        secure: false,
        auth: {
            user: smtpAccount.email,
            pass: smtpAccount.password,
        },
    });

    const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
    });
    console.log("[employee] nodemailer success:", info.messageId);
    return { via: "nodemailer", messageId: info.messageId };
}

export async function POST(request: Request) {
    try {
        // --- Auth check (must be admin/authenticated) ---
        const session = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();

        // 1. Validate payload
        const parsed = EmployeeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0]?.message || "Invalid data" },
                { status: 400 }
            );
        }

        const { name, username, email, role, phone, personalEmail } = parsed.data;

        // 2. Check for existing user by username or email
        const existingUser = await prisma.users.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this username or email already exists" },
                { status: 409 }
            );
        }

        // 3. Create email account in cPanel
        const [emailLocal, emailDomain] = email.split("@");

        const CPANEL_USERNAME = process.env.CPANEL_USERNAME;
        const CPANEL_API_TOKEN = process.env.CPANEL_API_TOKEN;
        const CPANEL_HOST = process.env.CPANEL_HOST;

        if (!CPANEL_USERNAME || !CPANEL_API_TOKEN || !CPANEL_HOST) {
            return NextResponse.json(
                { error: "Missing cPanel environment variables" },
                { status: 500 }
            );
        }

        const emailPassword = generateRandomPassword();

        const url = `https://${CPANEL_HOST}execute/Email/add_pop`;
        const params = new URLSearchParams({
            email: emailLocal,
            domain: emailDomain,
            password: emailPassword,
            quota: "0",
            skip_update_db: "0",
        });

        const cpanelResponse = await fetch(`${url}?${params.toString()}`, {
            method: "GET",
            headers: {
                Authorization: `cpanel ${CPANEL_USERNAME}:${CPANEL_API_TOKEN}`,
            },
        });

        const responseText = await cpanelResponse.text();

        if (responseText.trim().startsWith("<!DOCTYPE html>")) {
            return NextResponse.json(
                { error: "cPanel authentication failed" },
                { status: 401 }
            );
        }

        let cpanelResult;
        try {
            cpanelResult = JSON.parse(responseText);
        } catch (e) {
            return NextResponse.json(
                { error: "Invalid response from cPanel" },
                { status: 500 }
            );
        }

        if (
            cpanelResult.status === 0 ||
            (cpanelResult.errors && cpanelResult.errors.length > 0)
        ) {
            return NextResponse.json(
                { error: cpanelResult.errors?.[0] || "cPanel email creation failed" },
                { status: 400 }
            );
        }

        // 4. Transaction to create user + EmailAccount
        const hashedPassword = await hash(emailPassword, 12);
        const userRole: "ADMIN" | "SALES" | "MARKETING" = role;

        const { user: newUser } = await prisma.$transaction(async (tx) => {
            const user = await tx.users.create({
                data: {
                    name,
                    username,
                    email,
                    avatar: "",
                    account_name: "",
                    is_account_admin: false,
                    is_admin: role === "ADMIN",
                    userLanguage: "en",
                    userStatus: "ACTIVE",
                    password: hashedPassword,
                    phone: phone || null,
                    role: userRole,
                },
            });

            await tx.emailAccount.create({
                data: {
                    user: user.id,
                    email,
                    host: "mail.travelwithyuyana.com",
                    port: 993,
                    secure: true,
                    password: emailPassword,
                    mailbox: "INBOX",
                    sentMailbox: "Sent",
                    v: 0,
                },
            });

            return { user };
        });

        // 5. Send credentials to personal email (if provided)
        if (personalEmail) {
            // Fetch the admin's email account (sender)
            const adminAccount = await prisma.emailAccount.findFirst({
                where: { user: session.user.id },
            });

            const from = process.env.DEV_EMAIL || email; // fallback
            const subject = `Your new account at YuyanaCRM`;
            const html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
          <h2 style="color: #333;">Welcome, ${name}!</h2>
          <p>Your employee account has been created.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Password:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;"><code>${emailPassword}</code></td></tr>
          </table>
          <p style="margin-top: 20px;">Please log in at <a href="https://yuyana-crm.vercel.app/en">Yuyana CRM</a></p>
        </div>
      `;

            try {
                await sendCredentialsEmail({
                    from,
                    to: personalEmail,
                    subject,
                    html,
                    smtpAccount: {
                        host: "mail.travelwithyuyana.com", // fallback
                        email: process.env.DEV_EMAIL || email, // fallback
                        password: process.env.DEV_PASSWORD || emailPassword, //fallback
                        port: 587,
                    },
                });
            } catch (emailError) {
                console.error("[employee] failed to send credentials email:", emailError);
                // Continue – the employee is created, but the admin will need to manually share credentials
            }
        }

        // 6. Return success (no password in response)
        const { password: _, ...safeUser } = newUser as any;

        return NextResponse.json(
            {
                user: safeUser,
                message: personalEmail
                    ? "Employee created and credentials sent to personal email"
                    : "Employee created",
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("[EMPLOYEES_POST]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}