import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMarketingTemplate } from "@/actions/marketing/get-marketing-template";
import { updateMarketingTemplate } from "@/actions/marketing/update-marketing-template";
import { deleteMarketingTemplate } from "@/actions/marketing/delete-marketing-template";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const templateId = parts[parts.length - 1];

    if (!templateId) return new NextResponse("Template ID required", { status: 400 });

    const template = await getMarketingTemplate(templateId);
    if (!template) return new NextResponse("Not Found", { status: 404 });

    console.log("Fetched template:", template);
    return NextResponse.json(template);
  } catch (error) {
    console.error("[MARKETING_TEMPLATE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const templateId = parts[parts.length - 1];

    if (!templateId) return new NextResponse("Template ID required", { status: 400 });

    const body = await req.json();
    const { title, subtitle, subject, body: templateBody } = body;

    const updated = await updateMarketingTemplate({
      id: templateId,
      title,
      subtitle,
      subject,
      body: templateBody,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[MARKETING_TEMPLATE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const templateId = parts[parts.length - 1];

    if (!templateId) return new NextResponse("Template ID required", { status: 400 });

    const deleted = await deleteMarketingTemplate(templateId);

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error("[MARKETING_TEMPLATE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
