import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import createSegment from "@/actions/marketing/segments/create-segment";
import listSegments from "@/actions/marketing/segments/list-segments";
import evaluateSegment from "@/actions/marketing/segments/evaluate-segment";

export async function GET() {
  try {
    console.log("[SEGMENTS_ROUTE_GET] incoming request");
    const data = await listSegments();
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.log("[SEGMENTS_GET]", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action || "create";

    if (action === "evaluate") {
      const { filters } = body;
      const res = await evaluateSegment(filters);
      return NextResponse.json({ result: res }, { status: 200 });
    }

    if (action === "create") {
      // Extract only the fields we need for creation
      const {
        name,
        description,
        type,
        segmentationType,
        leadFilters,
        accountFilters,
        contactFilters,
        ownerId,
        emails,
      } = body;

      const seg = await createSegment({
        name,
        description,
        type,
        segmentationType,
        leadFilters,
        accountFilters,
        contactFilters,
        ownerId,
        emails,
      });

      return NextResponse.json({ segment: seg }, { status: 200 });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.log("[SEGMENTS_POST]", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}