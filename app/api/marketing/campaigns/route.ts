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

    const campaigns = await prismadb.crm_marketing_campaigns.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: true,
      },
    });

    const normalized = campaigns.map((c: any) => ({
      ...c,
      budget: c.budget && typeof c.budget === "object" && typeof c.budget.toNumber === "function" ? c.budget.toNumber() : c.budget ?? null,
      spent: c.spent && typeof c.spent === "object" && typeof c.spent.toNumber === "function" ? c.spent.toNumber() : c.spent ?? null,
      startDate: c.startDate ? (c.startDate instanceof Date ? c.startDate.toISOString() : c.startDate) : null,
      endDate: c.endDate ? (c.endDate instanceof Date ? c.endDate.toISOString() : c.endDate) : null,
      createdAt: c.createdAt ? (c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt) : null,
    }));

    return NextResponse.json(normalized);
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
      emailContent,
    } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Normalize payload for Prisma
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
      createdById: session.user.id,
    };

    const result = await prismadb.crm_marketing_campaigns.create({ data });

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
    console.error("[MARKETING_CAMPAIGNS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  // PATCH moved to dynamic route handler (/api/marketing/campaigns/[campaignId])
}

export async function DELETE(req: Request) {
  // DELETE moved to dynamic route handler (/api/marketing/campaigns/[campaignId])
}
