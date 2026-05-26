import { NextRequest, NextResponse } from "next/server";
import { getEmployeeActivity } from "@/actions/get-employee-activity";
import type { ReportTimeline } from "@/actions/employees/get-employee-charts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const { employeeId } = await params;
  const { searchParams } = new URL(request.url);

  const timeline = (searchParams.get("timeline") as ReportTimeline | null) ?? "monthly";
  const selected = searchParams.get("selected") ?? undefined;

  const activityData = await getEmployeeActivity(employeeId, {
    timeline: timeline === "weekly" ? "weekly" : "monthly",
    selected,
  });

  if (!activityData) {
    return NextResponse.json({ activity: [] }, { status: 404 });
  }

  return NextResponse.json(activityData);
}
