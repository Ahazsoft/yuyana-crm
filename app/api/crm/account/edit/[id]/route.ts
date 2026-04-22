import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse("Account ID is required", { status: 400 });
    }

    const body = await req.json();
    console.log("PUT /api/accounts/edit/[id] body:", body); // Debug

    const {
      name,
      office_phone,
      website,
      fax,
      company_id,
      vat,
      email,
      billing_street,
      billing_postal_code,
      billing_city,
      billing_state,
      billing_country,
      shipping_street,
      shipping_postal_code,
      shipping_city,
      shipping_state,
      shipping_country,
      description,
      assigned_to,
      status,
      annual_revenue,
      member_of,
      employees, // ← Use employees instead of industry
    } = body;

    // Basic validation
    if (!name || !email || !assigned_to) {
      return new NextResponse("Missing required fields (name, email, assigned_to)", {
        status: 400,
      });
    }

    const updatedAccount = await prismadb.crm_Accounts.update({
      where: { id },
      data: {
        updatedBy: session.user.id,
        name,
        office_phone: office_phone || undefined,
        website: website || undefined,
        fax: fax || undefined,
        company_id: company_id || undefined,
        vat: vat || undefined,
        email,
        billing_street: billing_street || undefined,
        billing_postal_code: billing_postal_code || undefined,
        billing_city: billing_city || undefined,
        billing_state: billing_state || undefined,
        billing_country: billing_country || undefined,
        shipping_street: shipping_street || undefined,
        shipping_postal_code: shipping_postal_code || undefined,
        shipping_city: shipping_city || undefined,
        shipping_state: shipping_state || undefined,
        shipping_country: shipping_country || undefined,
        description: description || undefined,
        assigned_to,
        status: status || undefined,
        annual_revenue: annual_revenue || undefined,
        member_of: member_of || undefined,
        employees: employees || undefined, // ← Save employees
      },
    });

    return NextResponse.json({ updatedAccount }, { status: 200 });
  } catch (error: any) {
    console.error("[ACCOUNT_UPDATE_PUT]", error);
    if (error?.code === "P2025") {
      return new NextResponse("Account not found", { status: 404 });
    }
    return new NextResponse(
      error?.message || "Internal server error",
      { status: 500 }
    );
  }
}