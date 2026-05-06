import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";

export async function GET(req: Request, { params }: any) {
  try {
    const { segmentId } = await params;
    const seg = await prismadb.marketingSegment.findUnique({
      where: { id: segmentId },
      include: { members: { include: { lead: true } } },
    });
    if (!seg) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // If segment stores emails (DYNAMIC), return those; otherwise return member lead emails
    const emails = Array.isArray((seg as any).emails) && (seg as any).emails.length > 0
      ? (seg as any).emails
      : (seg.members || []).map((m: any) => m.lead?.email).filter(Boolean);
    return NextResponse.json({ segment: seg, emails }, { status: 200 });
  } catch (e) {
    console.log("[SEGMENT_MEMBERS_GET_ERR]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: any) {
  try {
    const { segmentId } = await params;
    const body = await req.json();
    const emails: string[] = Array.isArray(body.emails) ? body.emails : [];
    // Determine segment type
    const seg = await prismadb.marketingSegment.findUnique({ where: { id: segmentId } });
    if (!seg) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const normalized = Array.from(new Set(emails.map((e) => (e || "").trim().toLowerCase()).filter(Boolean)));

    if ((seg as any).type === "DYNAMIC") {
      const replace = !!body.replace;
      if (replace) {
        // Replace existing emails with provided list
        await prismadb.marketingSegment.update({ where: { id: segmentId }, data: { emails: normalized, cachedCount: normalized.length } });
        return NextResponse.json({ ok: true, count: normalized.length }, { status: 200 });
      }
      // For DYNAMIC segments, append new emails to existing emails JSON and update cachedCount
      const existing: string[] = Array.isArray((seg as any).emails) ? (seg as any).emails.map((e: any) => (e || "").trim().toLowerCase()).filter(Boolean) : [];
      const merged = Array.from(new Set([...existing, ...normalized]));
      await prismadb.marketingSegment.update({ where: { id: segmentId }, data: { emails: merged, cachedCount: merged.length } });
      return NextResponse.json({ ok: true, count: merged.length }, { status: 200 });
    }

    // For STATIC (filters) segments, maintain member creation behavior (legacy)
    const leadIds: string[] = [];
    for (const email of normalized) {
      try {
        let lead = await prismadb.crm_Leads.findFirst({ where: { email } });
        if (!lead) {
          const localPart = (email.split("@")[0] || "").replace(/[^a-z0-9\-_.]/gi, " ").trim();
          lead = await prismadb.crm_Leads.create({ data: { firstName: localPart || "", lastName: "", email } });
        }
        if (lead && lead.id) leadIds.push(lead.id);
      } catch (e) {
        console.log("[SEGMENT_MEMBER_UPSERT_LEAD_ERR]", e);
      }
    }

    // remove members not in leadIds
    await prismadb.marketingSegmentMember.deleteMany({ where: { segmentId, leadId: { notIn: leadIds } } });

    if (leadIds.length > 0) {
      const createData = leadIds.map((leadId) => ({ segmentId, leadId }));
      await prismadb.marketingSegmentMember.createMany({ data: createData, skipDuplicates: true });
    }

    // update cachedCount
    await prismadb.marketingSegment.update({ where: { id: segmentId }, data: { cachedCount: leadIds.length } });

    return NextResponse.json({ ok: true, count: leadIds.length }, { status: 200 });
  } catch (e) {
    console.log("[SEGMENT_MEMBERS_POST_ERR]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
