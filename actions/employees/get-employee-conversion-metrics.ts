import { prismadb } from "@/lib/prisma";

export type ReportTimeline = "weekly" | "monthly";

interface DateRange {
  start: Date;
  end: Date;
}

export interface EmployeeConversionMetrics {
  timeline: ReportTimeline;
  selected: string;
  leadCount: number;
  conversionCount: number;
  conversionRate: number;
  label: string;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getCurrentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}

function getCurrentWeekValue() {
  const now = new Date();
  const current = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const day = current.getUTCDay() || 7;
  current.setUTCDate(current.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((current.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return `${current.getUTCFullYear()}-W${pad(week)}`;
}

function getWeekRangeFromSelection(value: string): DateRange | null {
  const match = /^([0-9]{4})-W([0-9]{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const week = Number(match[2]);

  if (!Number.isFinite(year) || !Number.isFinite(week) || week < 1 || week > 53) {
    return null;
  }

  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - jan4Day + 1);
  monday.setDate(monday.getDate() + (week - 1) * 7);

  const start = startOfDay(monday);
  const end = endOfDay(new Date(start));
  end.setDate(start.getDate() + 6);

  return { start, end };
}

function getMonthRangeFromSelection(value: string): DateRange | null {
  const match = /^([0-9]{4})-([0-9]{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;

  if (!Number.isFinite(year) || monthIndex < 0 || monthIndex > 11) {
    return null;
  }

  const start = startOfDay(new Date(year, monthIndex, 1));
  const end = endOfDay(new Date(year, monthIndex + 1, 0));

  return { start, end };
}

function resolveRange(timeline: ReportTimeline, selected?: string): { range: DateRange; selected: string } {
  if (timeline === "weekly") {
    const fallback = getCurrentWeekValue();
    const parsed = selected ? getWeekRangeFromSelection(selected) : null;
    if (parsed) {
      return { range: parsed, selected: selected ?? fallback };
    }

    return {
      range: getWeekRangeFromSelection(fallback) ?? getWeekRangeFromSelection(getCurrentWeekValue())!,
      selected: fallback,
    };
  }

  const fallback = getCurrentMonthValue();
  const parsed = selected ? getMonthRangeFromSelection(selected) : null;
  if (parsed) {
    return { range: parsed, selected: selected ?? fallback };
  }

  return {
    range: getMonthRangeFromSelection(fallback) ?? getMonthRangeFromSelection(getCurrentMonthValue())!,
    selected: fallback,
  };
}

function formatLabel(timeline: ReportTimeline, selected: string) {
  if (timeline === "weekly") {
    const range = getWeekRangeFromSelection(selected);
    if (!range) {
      return selected;
    }

    return `${range.start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${range.end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
  }

  const range = getMonthRangeFromSelection(selected);
  if (!range) {
    return selected;
  }

  return range.start.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export async function getEmployeeConversionMetrics(
  employeeId: string,
  options?: { timeline?: ReportTimeline; selected?: string }
): Promise<EmployeeConversionMetrics> {
  const timeline = options?.timeline ?? "monthly";
  const { range, selected } = resolveRange(timeline, options?.selected);

  const [leadCount, conversionCount] = await Promise.all([
    prismadb.crm_Leads.count({
      where: {
        assigned_to: employeeId,
        createdAt: { gte: range.start, lte: range.end },
      },
    }),
    prismadb.crm_LeadConversions.count({
      where: {
        OR: [{ assigned_to: employeeId }, { convertedBy: employeeId }],
        convertedAt: { gte: range.start, lte: range.end },
      },
    }),
  ]);

  const conversionRate = leadCount + conversionCount > 0
    ? Number(((conversionCount / (leadCount + conversionCount)) * 100).toFixed(2))
    : 0;

  return {
    timeline,
    selected,
    leadCount,
    conversionCount,
    conversionRate,
    label: formatLabel(timeline, selected),
  };
}
