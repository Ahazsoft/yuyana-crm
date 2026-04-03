import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";
import { createMarketingCampaign } from "@/actions/marketing/create-marketing-campaign";
import { updateMarketingCampaign } from "@/actions/marketing/update-marketing-campaign";
import { deleteMarketingCampaign } from "@/actions/marketing/delete-marketing-campaign";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const campaigns = await prismadb.crm_marketing_campaigns.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        createdBy: true
      }
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("[MARKETING_CAMPAIGNS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
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
      emailContent
    } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const result = await createMarketingCampaign({
      name,
      description,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      budget,
      targetAudience,
      emailSubject,
      emailContent
    });

    if ('error' in result) {
      return new NextResponse(result.error, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[MARKETING_CAMPAIGNS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Extract campaignId from the request URL more reliably
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    // The path should be something like /api/marketing/campaigns/:id
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
      emailContent
    } = body;

    const result = await updateMarketingCampaign({
      id: campaignId,
      name,
      description,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      budget,
      targetAudience,
      emailSubject,
      emailContent
    });

    if ('error' in result) {
      return new NextResponse(result.error, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[MARKETING_CAMPAIGNS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Extract campaignId from the request URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const campaignId = pathParts[pathParts.length - 1];

    if (!campaignId) {
      return new NextResponse("Campaign ID is required", { status: 400 });
    }

    const result = await deleteMarketingCampaign({ id: campaignId });

    if ('error' in result) {
      return new NextResponse(result.error, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MARKETING_CAMPAIGNS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}