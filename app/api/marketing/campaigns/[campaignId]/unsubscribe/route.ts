import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    const { campaignId } = await params;
    const { searchParams } = new URL(req.url);
    const recipient = searchParams.get("recipient") ?? "";

    return new NextResponse(
      `<!doctype html><html><body style="font-family:Arial,sans-serif;padding:24px;">\n<p>You've been unsubscribed from campaign ${campaignId}${recipient ? ` for ${recipient}` : ""}.</p>\n</body></html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  } catch {
    return new NextResponse("Unable to process unsubscribe request", { status: 500 });
  }
}
