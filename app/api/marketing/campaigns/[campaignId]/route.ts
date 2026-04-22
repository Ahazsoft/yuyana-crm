import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const campaignId = pathParts[pathParts.length - 1];

    if (!campaignId) {
      return new NextResponse("Campaign ID is required", { status: 400 });
    }

    const campaign = await prismadb.crm_marketing_campaigns.findUnique({
      where: { id: campaignId },
      include: { createdBy: true },
    });

    if (!campaign) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const normalized: any = {
      ...campaign,
      budget: campaign.budget && typeof campaign.budget === "object" && typeof campaign.budget.toNumber === "function" ? campaign.budget.toNumber() : campaign.budget ?? null,
      spent: campaign.spent && typeof campaign.spent === "object" && typeof campaign.spent.toNumber === "function" ? campaign.spent.toNumber() : campaign.spent ?? null,
      startDate: campaign.startDate ? (campaign.startDate instanceof Date ? campaign.startDate.toISOString() : campaign.startDate) : null,
      endDate: campaign.endDate ? (campaign.endDate instanceof Date ? campaign.endDate.toISOString() : campaign.endDate) : null,
      createdAt: campaign.createdAt ? (campaign.createdAt instanceof Date ? campaign.createdAt.toISOString() : campaign.createdAt) : null,
    };

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("[MARKETING_CAMPAIGN_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const campaignId = pathParts[pathParts.length - 1];

    if (!campaignId) {
      return new NextResponse("Campaign ID is required", { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      description,
      status,
      startDate,
      endDate,
      budget,
      targetAudience,
      emailSubject,
      emailContent,
    } = body;

    const data: any = {
      name,
      description,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      budget: budget ?? undefined,
      targetAudience: targetAudience ?? undefined,
      emailSubject,
      emailContent: typeof emailContent === "object" ? JSON.stringify(emailContent) : emailContent,
    };

    const result = await prismadb.crm_marketing_campaigns.update({ where: { id: campaignId }, data });

    const normalizedResult: any = {
      ...result,
      budget: result.budget && typeof result.budget === "object" && typeof result.budget.toNumber === "function" ? result.budget.toNumber() : result.budget ?? null,
      spent: result.spent && typeof result.spent === "object" && typeof result.spent.toNumber === "function" ? result.spent.toNumber() : result.spent ?? null,
      startDate: result.startDate ? (result.startDate instanceof Date ? result.startDate.toISOString() : result.startDate) : null,
      endDate: result.endDate ? (result.endDate instanceof Date ? result.endDate.toISOString() : result.endDate) : null,
      createdAt: result.createdAt ? (result.createdAt instanceof Date ? result.createdAt.toISOString() : result.createdAt) : null,
    };

    return NextResponse.json(normalizedResult);
  } catch (error) {
    console.error("[MARKETING_CAMPAIGN_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const campaignId = pathParts[pathParts.length - 1];

    if (!campaignId) {
      return new NextResponse("Campaign ID is required", { status: 400 });
    }

    await prismadb.crm_marketing_campaigns.delete({ where: { id: campaignId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MARKETING_CAMPAIGN_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
