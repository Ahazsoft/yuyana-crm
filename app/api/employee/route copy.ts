// app/api/employees/route.ts
//@ts-nocheck
import { NextResponse } from "next/server";
import { prismadb as prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";

// Re‑use the same schema (import or duplicate)
const EmployeeSchema = z.object({
    name: z.string().min(2),
    username: z.string().min(2).regex(/^[a-z0-9_]+$/),
    email: z.string().email(),
    role: z.enum(["ADMIN", "SALES", "MARKETING"]),
    phone: z.string().nullable().optional(),
});

// cPanel password generator (same as your code)
function generateRandomPassword(length = 16) {
    return crypto
        .randomBytes(length)
        .toString("base64")
        .slice(0, length)
        .replace(/[/+=]/g, "a")
        .concat("!1A");
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Validate payload (server‑side)
        const parsed = EmployeeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(

                { error: parsed.error.errors[0]?.message || "Invalid data" },
                { status: 400 }
            );
        }

        const { name, username, email, role, phone } = parsed.data;
        console.log("parsed data", { name, username, email, role, phone });

        // 2. Check for existing user by username OR email
        const existingUser = await prisma.users.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: email },
                ],
            },
        });
        console.log("existing user check", { existingUser });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this username or email already exists" },
                { status: 409 }
            );
        }

        // 3. Create email account in cPanel
        //    Split email into local part and domain (domain is always the same, but we can extract)
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
            quota: "0", // unlimited
            skip_update_db: "0",
        });

        const cpanelResponse = await fetch(`${url}?${params.toString()}`, {
            method: "GET",
            headers: {
                Authorization: `cpanel ${CPANEL_USERNAME}:${CPANEL_API_TOKEN}`,
            },
        });

        const responseText = await cpanelResponse.text();

        // Check for login page (authentication failure)
        if (responseText.trim().startsWith("<!DOCTYPE html>")) {
            return NextResponse.json(
                {
                    error: "cPanel authentication failed. Check API token.",
                },
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
                {
                    error: cpanelResult.errors?.[0] || "cPanel email creation failed",
                },
                { status: 400 }
            );
        }

        // 4. Email created successfully → create user in database
        const hashedPassword = await hash(emailPassword, 12);
        const userRole: "ADMIN" | "SALES" | "MARKETING" = role;

        const { user: newUser, emailAccount } = await prisma.$transaction(
            async (tx) => {
                const user = await tx.users.create({
                    data: {
                        name,
                        username,
                        email,
                        avatar: "",
                        account_name: "",
                        is_account_admin: false,
                        is_admin: role === "ADMIN" ? true : false,
                        userLanguage: "en",
                        userStatus: "ACTIVE",
                        password: hashedPassword,
                        phone: phone || null,
                        role: userRole,
                    },
                });

                const emailAccount = await tx.emailAccount.create({
                    data: {
                        user: user.id,
                        email: email,
                        host: "mail.travelwithyuyana.com",
                        port: 993,
                        secure: true,
                        password: emailPassword,
                        mailbox: "INBOX",
                        v: 0, 
                    },
                });

                return { user, emailAccount };
            }
        );

        // 5. Return success (without hashed password, but include plain email password)
        const { password: _, ...safeUser } = newUser as any;

        return NextResponse.json(
            {
                user: safeUser,
                password: emailPassword,     // for admin to share with the employee
                message: "Employee created successfully",
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