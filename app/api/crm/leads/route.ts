import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sendEmail from "@/lib/sendmail";

//Create a new lead route
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }
  try {
    const body = await req.json();
    const userId = session.user.id;

    if (!body) {
      return new NextResponse("No form data", { status: 400 });
    }

    const {
      first_name,
      last_name,
      company,
      // jobTitle,
      email,
      phone,
      description,
      lead_source,
      refered_by,
      campaign,
      assigned_to,
      accountIDs,
      followup_date,
      service,
      status
    } = body;


    const newLead = await prismadb.crm_Leads.create({
      data: {
        v: 1,
        createdBy: userId,
        updatedBy: userId,
        firstName: first_name,
        lastName: last_name,
        company,
        // jobTitle,
        email,
        phone,
        description,
        lead_source,
        refered_by,
        campaign,
        followup_date: followup_date ?? null,
        service: service,
        assigned_to: assigned_to || userId,
        accountsIDs: accountIDs,
        status: status || "New",
        type: "DEMO",
      },
    });

    const authUser = await prismadb.users.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
      }
    });

    const adminUsers = await prismadb.users.findMany({
      where: {
        role: "ADMIN",
      }
    });

    if (authUser) {
      if (adminUsers.length > 0) {
        await prismadb.notifications.createMany({
          data: adminUsers.map((admin) => ({
            title: `New Lead Added: ${first_name}`,
            description: `Lead Contact : ${first_name} has been added by: ${authUser.name}.`,
            receiverId: admin.id,
            link: `/crm/leads/${newLead.id}`,
            category: "CRM",
            subCategory: "Lead",       
          })),
        });
      }
    }

    return NextResponse.json({ newLead }, { status: 200 });
  } catch (error) {
    console.log("[NEW_LEAD_POST]", error);
    return new NextResponse("Initial error", { status: 500 });
  }
}

//UPdate a lead route
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }
  try {
    const body = await req.json();
    const userId = session.user.id;

    if (!body) {
      return new NextResponse("No form data", { status: 400 });
    }

    const {
      id,
      firstName,
      lastName,
      company,
      jobTitle,
      email,
      phone,
      description,
      lead_source,
      refered_by,
      campaign,
      assigned_to,
      accountIDs,
      status,
      service,
      followup_date,
      type,
    } = body;

    const updatedLead = await prismadb.crm_Leads.update({
      where: {
        id,
      },
      data: {
        v: 1,
        updatedBy: userId,
        firstName,
        lastName,
        company,
        jobTitle,
        email,
        phone,
        description,
        lead_source,
        refered_by,
        campaign,
        service: service,
        followup_date: followup_date ?? null,
        assigned_to: assigned_to || userId,
        accountsIDs: accountIDs,
        status,
        type,
      },
    });

    const lead = await prismadb.crm_Leads.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
      }
    });
     const authUser = await prismadb.users.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
      }
    });

    const adminUsers = await prismadb.users.findMany({
      where: {
        role: "ADMIN",
      }
    });

    if (authUser && lead) {
      if (adminUsers.length > 0) {
        await prismadb.notifications.createMany({
          data: adminUsers.map((admin) => ({
            title: `Lead Updated: ${lead.firstName}`,
            description: `Lead Contact Updated : ${lead.firstName} has been added by: ${authUser.name}.`,
            receiverId: admin.id,
            link: `/crm/leads/${updatedLead.id}`,
            category: "CRM",
            subCategory: "Lead",
          })),
        });
      }
    }

    return NextResponse.json({ updatedLead }, { status: 200 });
  } catch (error) {
    console.log("[UPDATED_LEAD_POST]", error);
    return new NextResponse("Initial error", { status: 500 });
  }
}
