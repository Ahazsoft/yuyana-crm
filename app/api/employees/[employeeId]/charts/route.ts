import { NextRequest, NextResponse } from "next/server";
import {
  getEmployeeCharts,
  type ReportTimeline,
} from "@/actions/employees/get-employee-charts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const { employeeId } = await params;
  const { searchParams } = new URL(request.url);

  const timeline = (searchParams.get("timeline") as ReportTimeline | null) ?? "monthly";
  const selected = searchParams.get("selected") ?? undefined;

  const chartData = await getEmployeeCharts(employeeId, {
    timeline: timeline === "weekly" ? "weekly" : "monthly",
    selected,
  });

  return NextResponse.json(chartData);
}
