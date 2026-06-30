import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prismadb } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  props: { params: Promise<{ leadId: string }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }

  if (!params.leadId) {
    return new NextResponse("Lead ID is required", { status: 400 });
  }

  try {
    const lead = await prismadb.crm_Leads.findUnique({
      where: {
        id: params.leadId,
      },
    });

    if (!lead) {
      return new NextResponse("Lead not found", { status: 404 });
    }

    const result = await prismadb.$transaction(async (tx) => {
      const newContact = await tx.crm_Contacts.create({
        data: {
          v: 0,
          createdBy: lead.assigned_to,
          updatedBy: lead.assigned_to,
          created_by: lead.assigned_to,
          assigned_to: lead.assigned_to ?? session.user.id,
          first_name: lead.firstName,
          last_name: lead.lastName ?? "",
          description: [
            lead.description,
            lead.company ? `Company: ${lead.company}` : null,
          ]
            .filter(Boolean)
            .join(" | ") || null,
          email: lead.email,
          mobile_phone: lead.phone,
          type: "Customer",
          status: true,
          ...(lead.accountsIDs ? { accountsIDs: lead.accountsIDs } : {}),
        },
      });

      const conversion = await tx.crm_LeadConversions.create({
        data: {
          customerId: newContact.id,
          convertedBy: session.user.id,
          lead_source: lead.lead_source,
          refered_by: lead.refered_by,
          campaign: lead.campaign,
          status: lead.status ?? "CONVERTED",
          type: lead.type ?? "DEMO",
          assigned_to: lead.assigned_to ?? session.user.id,
          followup_date: lead.followup_date ?? null,
          service: lead.service ?? "OUTBOUND",
        },
      });

      await tx.crm_Leads.delete({
        where: {
          id: params.leadId,
        },
      });

      return {
        contact: newContact,
        conversion,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[PROMOTE_LEAD_TO_CUSTOMER]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
