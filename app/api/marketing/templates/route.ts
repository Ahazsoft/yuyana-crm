import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";
import { createMarketingTemplate } from "@/actions/marketing/create-marketing-template";
import { updateMarketingTemplate } from "@/actions/marketing/update-marketing-template";
import { deleteMarketingTemplate } from "@/actions/marketing/delete-marketing-template";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const templates = await prismadb.email_templates.findMany({
      orderBy: { createdAt: "desc" },
      include: { created_by_user: true },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("[MARKETING_TEMPLATES_GET]", error);
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
    const { title, subtitle, subject, body: templateBody } = body;

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    const result = await createMarketingTemplate({
      title,
      subtitle,
      subject,
      body: templateBody,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[MARKETING_TEMPLATES_POST]", error);
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
    const templateId = pathParts[pathParts.length - 1];

    if (!templateId) {
      return new NextResponse("Template ID is required", { status: 400 });
    }

    const body = await req.json();
    const { title, subtitle, subject, body: templateBody } = body;

    const result = await updateMarketingTemplate({
      id: templateId,
      title,
      subtitle,
      subject,
      body: templateBody,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[MARKETING_TEMPLATES_PATCH]", error);
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
    const templateId = pathParts[pathParts.length - 1];

    if (!templateId) {
      return new NextResponse("Template ID is required", { status: 400 });
    }

    const result = await deleteMarketingTemplate(templateId);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("[MARKETING_TEMPLATES_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
