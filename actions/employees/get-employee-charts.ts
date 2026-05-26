import { prismadb } from "@/lib/prisma";

export type ReportTimeline = "weekly" | "monthly";

const ACTIVITY_COLORS = {
  Accounts: "#09707e",
  Contacts: "#0ea5e9",
  Leads: "#10b981",
  Opportunities: "#f97316",
  Contracts: "#a855f7",
} as const;

interface DateRange {
  start: Date;
  end: Date;
}

interface BucketDefinition {
  label: string;
  start: Date;
  end: Date;
}

export interface EmployeeMonthlyActivity {
  month: string;
  accounts: number;
  contacts: number;
  leads: number;
  opportunities: number;
  contracts: number;
}

export interface EmployeeActivityBreakdown {
  type: string;
  count: number;
  color: string;
}

export interface EmployeeChartData {
  timeline: ReportTimeline;
  selected: string;
  monthlyActivity: EmployeeMonthlyActivity[];
  activityBreakdown: EmployeeActivityBreakdown[];
  totalEntries: number;
  title: string;
  subtitle: string;
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

    return { range: getWeekRangeFromSelection(fallback) ?? getWeekRangeFromSelection(getCurrentWeekValue())!, selected: fallback };
  }

  const fallback = getCurrentMonthValue();
  const parsed = selected ? getMonthRangeFromSelection(selected) : null;
  if (parsed) {
    return { range: parsed, selected: selected ?? fallback };
  }

  return { range: getMonthRangeFromSelection(fallback) ?? getMonthRangeFromSelection(getCurrentMonthValue())!, selected: fallback };
}

function buildWeeklyBuckets(range: DateRange): BucketDefinition[] {
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(range.start);
    day.setDate(range.start.getDate() + index);

    return {
      label: day.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      start: startOfDay(day),
      end: endOfDay(day),
    };
  });
}

function buildMonthlyBuckets(range: DateRange): BucketDefinition[] {
  const buckets: BucketDefinition[] = [];
  let cursor = new Date(range.start);

  while (cursor <= range.end) {
    const bucketStart = new Date(cursor);
    const bucketEnd = new Date(cursor);
    bucketEnd.setDate(bucketEnd.getDate() + 6);

    if (bucketEnd > range.end) {
      bucketEnd.setTime(range.end.getTime());
    }

    buckets.push({
      label: `${bucketStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${bucketEnd.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`,
      start: startOfDay(bucketStart),
      end: endOfDay(bucketEnd),
    });

    cursor.setDate(cursor.getDate() + 7);
  }

  return buckets;
}

function buildActivitySeries(
  buckets: BucketDefinition[],
  rows: { createdAt: Date | null }[]
) {
  const counts = buckets.map(() => ({
    accounts: 0,
    contacts: 0,
    leads: 0,
    opportunities: 0,
    contracts: 0,
  }));

  rows.forEach((row) => {
    const createdAt = row.createdAt ? new Date(row.createdAt) : null;
    if (!createdAt) {
      return;
    }

    for (let index = 0; index < buckets.length; index++) {
      const bucket = buckets[index];
      if (createdAt >= bucket.start && createdAt <= bucket.end) {
        counts[index].accounts += 1;
        break;
      }
    }
  });

  return buckets.map((bucket, index) => ({
    month: bucket.label,
    accounts: counts[index].accounts,
    contacts: counts[index].contacts,
    leads: counts[index].leads,
    opportunities: counts[index].opportunities,
    contracts: counts[index].contracts,
  }));
}

function bucketRecordsByType(
  buckets: BucketDefinition[],
  rows: { createdAt: Date | null }[]
) {
  const counts = buckets.map(() => 0);

  rows.forEach((row) => {
    const createdAt = row.createdAt ? new Date(row.createdAt) : null;
    if (!createdAt) {
      return;
    }

    for (let index = 0; index < buckets.length; index++) {
      const bucket = buckets[index];
      if (createdAt >= bucket.start && createdAt <= bucket.end) {
        counts[index] += 1;
        break;
      }
    }
  });

  return counts;
}

function buildBreakdown(
  totalCounts: {
    accounts: number;
    contacts: number;
    leads: number;
    opportunities: number;
    contracts: number;
  }
): EmployeeActivityBreakdown[] {
  return [
    { type: "Accounts", count: totalCounts.accounts, color: ACTIVITY_COLORS.Accounts },
    { type: "Contacts", count: totalCounts.contacts, color: ACTIVITY_COLORS.Contacts },
    { type: "Leads", count: totalCounts.leads, color: ACTIVITY_COLORS.Leads },
    { type: "Events", count: totalCounts.opportunities, color: ACTIVITY_COLORS.Opportunities },
    { type: "Contracts", count: totalCounts.contracts, color: ACTIVITY_COLORS.Contracts },
  ].filter((item) => item.count > 0);
}

function formatPeriodLabel(timeline: ReportTimeline, selected: string) {
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

function getTitle(timeline: ReportTimeline, selected: string) {
  const label = formatPeriodLabel(timeline, selected);
  return `${timeline === "weekly" ? "Weekly" : "Monthly"} Activity · ${label}`;
}

function getSubtitle(timeline: ReportTimeline) {
  return timeline === "weekly"
    ? "Entries created in the selected week"
    : "Entries created in the selected month";
}

export async function getEmployeeCharts(
  employeeId: string,
  options?: { timeline?: ReportTimeline; selected?: string }
): Promise<EmployeeChartData> {
  const timeline = options?.timeline ?? "monthly";
  const { range, selected } = resolveRange(timeline, options?.selected);

  const [accountsRaw, contactsRaw, leadsRaw, oppsRaw, contractsRaw] =
    await Promise.all([
      prismadb.crm_Accounts.findMany({
        where: {
          createdBy: employeeId,
          createdAt: { gte: range.start, lte: range.end },
        },
        select: { createdAt: true },
      }),
      prismadb.crm_Contacts.findMany({
        where: {
          createdBy: employeeId,
          cratedAt: { gte: range.start, lte: range.end },
        },
        select: { cratedAt: true },
      }),
      prismadb.crm_Leads.findMany({
        where: {
          createdBy: employeeId,
          createdAt: { gte: range.start, lte: range.end },
        },
        select: { createdAt: true },
      }),
      prismadb.crm_Opportunities.findMany({
        where: {
          created_by: employeeId,
          createdAt: { gte: range.start, lte: range.end },
        },
        select: { createdAt: true },
      }),
      prismadb.crm_Contracts.findMany({
        where: {
          createdBy: employeeId,
          createdAt: { gte: range.start, lte: range.end },
        },
        select: { createdAt: true },
      }),
    ]);

  const buckets = timeline === "weekly" ? buildWeeklyBuckets(range) : buildMonthlyBuckets(range);

  const accounts = accountsRaw.map((row) => ({ createdAt: row.createdAt }));
  const contacts = contactsRaw.map((row) => ({ createdAt: row.cratedAt ?? null }));
  const leads = leadsRaw.map((row) => ({ createdAt: row.createdAt ?? null }));
  const opportunities = oppsRaw.map((row) => ({ createdAt: row.createdAt }));
  const contracts = contractsRaw.map((row) => ({ createdAt: row.createdAt ?? null }));

  const monthlyActivity: EmployeeMonthlyActivity[] = buckets.map((bucket, index) => ({
    month: bucket.label,
    accounts: bucketRecordsByType([bucket], accounts)[0],
    contacts: bucketRecordsByType([bucket], contacts)[0],
    leads: bucketRecordsByType([bucket], leads)[0],
    opportunities: bucketRecordsByType([bucket], opportunities)[0],
    contracts: bucketRecordsByType([bucket], contracts)[0],
  }));

  const totalEntries =
    accountsRaw.length +
    contactsRaw.length +
    leadsRaw.length +
    oppsRaw.length +
    contractsRaw.length;

  const activityBreakdown = buildBreakdown({
    accounts: accountsRaw.length,
    contacts: contactsRaw.length,
    leads: leadsRaw.length,
    opportunities: oppsRaw.length,
    contracts: contractsRaw.length,
  });

  return {
    timeline,
    selected,
    monthlyActivity,
    activityBreakdown,
    totalEntries,
    title: getTitle(timeline, selected),
    subtitle: getSubtitle(timeline),
  };
}
