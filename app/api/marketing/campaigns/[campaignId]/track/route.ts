import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    const { campaignId } = await params;
    const { searchParams } = new URL(req.url);
    const recipient = searchParams.get("recipient") ?? "";

    if (!campaignId) {
      return new NextResponse(null, { status: 400 });
    }

    await prismadb.crm_marketing_campaigns.update({
      where: { id: campaignId },
      data: {
        openCount: { increment: 1 },
        updatedAt: new Date(),
      },
    });

    return new NextResponse(
      Buffer.from(
        "\u0019PNG\r\n\u001a\n" +
          "\u0000\u0000\u0000\rIHDR\u0000\u0000\u0000\u0001\u0000\u0000\u0000\u0001\u0008\u0006\u0000\u0000\u0000\u001f\u001f\u0000\u0000\u0000\u0000IEND\u00aeB`\u0082",
      ),
      {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("Campaign tracking error", error);
    return new NextResponse(null, { status: 500 });
  }
}
