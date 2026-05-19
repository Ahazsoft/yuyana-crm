import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sendEmail from "@/lib/sendmail";

//Create route
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

    console.log({ body });
    const {
      assigned_to,
      assigned_account,
      // birthday_day,
      // birthday_month,
      // birthday_year,
      birthday,
      description,
      email,
      personal_email,
      first_name,
      last_name,
      office_phone,
      mobile_phone,
      website,
      status,
      social_twitter,
      social_facebook,
      social_linkedin,
      social_skype,
      social_instagram,
      social_youtube,
      social_tiktok,
      type,
    } = body;

    const newContact = await prismadb.crm_Contacts.create({
      data: {
        v: 0,
        createdBy: userId,
        updatedBy: userId,
        ...(assigned_account
          ? {
            assigned_accounts: {
              connect: {
                id: assigned_account,
              },
            },
          }
          : {}),
        ...(assigned_to
          ? {
            assigned_to_user: {
              connect: {
                id: assigned_to,
              },
            },
          }
          : {}),
        birthday,
        description,
        email,
        personal_email,
        first_name,
        last_name: last_name ?? "",
        office_phone,
        mobile_phone,
        website,
        status,
        social_twitter,
        social_facebook,
        social_linkedin,
        social_skype,
        social_instagram,
        social_youtube,
        social_tiktok,
        type,
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
            title: `New Contacts Added: ${first_name}`,
            description: `Contact : ${first_name} has been added by: ${authUser.name}.`,
            receiverId: admin.id,
            link: `/crm/contacts/${newContact.id}`,
            category: "CRM",
            subCategory: "Contact",
          })),
        });
      }
    }
    console.log("New contact created:", newContact);

    return NextResponse.json({ newContact }, { status: 200 });
  } catch (error) {
    console.log("[NEW_CONTACT_POST]", error);
    return new NextResponse("Initial error", { status: 500 });
  }
}

//Update route
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
      assigned_account,
      assigned_to,
      // birthday_day,
      // birthday_month,
      // birthday_year,
      birthday,
      description,
      email,
      personal_email,
      first_name,
      last_name,
      office_phone,
      mobile_phone,
      website,
      status,
      social_twitter,
      social_facebook,
      social_linkedin,
      social_skype,
      social_instagram,
      social_youtube,
      social_tiktok,
      type,
    } = body;

    const newContact = await prismadb.crm_Contacts.update({
      where: {
        id,
      },
      data: {
        v: 0,
        updatedBy: userId,
        ...(assigned_account
          ? {
            assigned_accounts: {
              connect: {
                id: assigned_account,
              },
            },
          }
          : {}),
        ...(assigned_to
          ? {
            assigned_to_user: {
              connect: {
                id: assigned_to,
              },
            },
          }
          : {}),
        birthday,
        // birthday:
        //   birthday_day && birthday_month && birthday_year
        //     ? birthday_day + "/" + birthday_month + "/" + birthday_year
        //     : null,
        description,
        email,
        personal_email,
        first_name,
        last_name,
        office_phone,
        mobile_phone,
        website,
        status,
        social_twitter,
        social_facebook,
        social_linkedin,
        social_skype,
        social_instagram,
        social_youtube,
        social_tiktok,
        type,
      },
    });


    return NextResponse.json({ newContact }, { status: 200 });
  } catch (error) {
    console.log("UPDATE_CONTACT_PUT]", error);
    return new NextResponse("Initial error", { status: 500 });
  }
}

//GET all accounts route
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }
  try {
    const contacts = await prismadb.crm_Contacts.findMany({});

    return NextResponse.json(contacts, { status: 200 });
  } catch (error) {
    console.log("[ACCOUNTS_GET]", error);
    return new NextResponse("Initial error", { status: 500 });
  }
}