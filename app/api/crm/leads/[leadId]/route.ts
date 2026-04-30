import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prismadb } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request, props: { params: Promise<{ leadId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }

  if (!params.leadId) {
    return new NextResponse("Lead ID is required", { status: 400 });
  }

  try {
    await prismadb.crm_Leads.delete({
      where: {
        id: params.leadId,
      },
    });

    return NextResponse.json({ message: "Lead deleted" }, { status: 200 });
  } catch (error) {
    console.log("[LEAD_DELETE]", error);
    return new NextResponse("Initial error", { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ leadId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }

  if (!params.leadId) {
    return new NextResponse("Lead ID is required", { status: 400 });
  }

  try {
    const body = await req.json();
    const { isArchived } = body;

    if (!isArchived || !["active", "archived"].includes(isArchived)) {
      return new NextResponse("Invalid archive status", { status: 400 });
    }

    const lead = await prismadb.crm_Leads.update({
      where: {
        id: params.leadId,
      },
      data: {
        isArchived,
      },
    });

    return NextResponse.json({ 
      message: isArchived === "archived" ? "Lead archived" : "Lead unarchived",
      lead 
    }, { status: 200 });
  } catch (error) {
    console.log("[LEAD_ARCHIVE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}