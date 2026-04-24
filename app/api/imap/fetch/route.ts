import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchRecentEmails, getImapConfig } from "@/lib/imap";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : 20;

    const userId = session.user?.id as string | undefined;
    // Validate IMAP configuration early to return a clear, actionable error
    try {
      await getImapConfig(userId);
    } catch (cfgErr: any) {
      return NextResponse.json({ error: cfgErr?.message || "IMAP configuration missing" }, { status: 400 });
    }

    const emails = await fetchRecentEmails({ limit, userId });

    return NextResponse.json({ data: emails }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch emails" }, { status: 500 });
  }
}
