import { NextRequest, NextResponse } from "next/server";
import {
  getEmployeeConversionMetrics,
  type ReportTimeline,
} from "@/actions/employees/get-employee-conversion-metrics";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const { employeeId } = await params;
  const { searchParams } = new URL(request.url);

  const timeline = (searchParams.get("timeline") as ReportTimeline | null) ?? "monthly";
  const selected = searchParams.get("selected") ?? undefined;

  const metrics = await getEmployeeConversionMetrics(employeeId, {
    timeline: timeline === "weekly" ? "weekly" : "monthly",
    selected,
  });

  return NextResponse.json(metrics);
}
