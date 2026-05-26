import { prismadb } from "@/lib/prisma";

// Returns last N months as short labels e.g. ["Jan", "Feb", ...]
function getLast6MonthLabels(): { label: string; year: number; month: number }[] {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      label: d.toLocaleString("en-US", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth(), // 0-indexed
    });
  }
  return result;
}

function bucketByMonth(
  rows: { createdAt: Date | null }[],
  months: { label: string; year: number; month: number }[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  months.forEach((m) => (counts[m.label] = 0));

  rows.forEach((row) => {
    const d = row.createdAt ? new Date(row.createdAt) : null;
    if (!d) return;
    const match = months.find(
      (m) => m.year === d.getFullYear() && m.month === d.getMonth()
    );
    if (match) counts[match.label]++;
  });

  return counts;
}

export interface MonthlyTrendPoint {
  month: string;
  leads: number;
  opportunities: number;
  accounts: number;
  contacts: number;
}

export interface StageBreakdownPoint {
  stage: string;
  count: number;
}

export interface TaskStatusPoint {
  status: string;
  count: number;
}

export interface GrowthMetric {
  category: string;
  lastMonth: number;
  thisMonth: number;
  change: number;
  percentChange: number;
  trend: "up" | "down" | "neutral";
}

export interface DashboardChartData {
  monthlyTrend: MonthlyTrendPoint[];
  stageBreakdown: StageBreakdownPoint[];
  taskStatus: TaskStatusPoint[];
  growthMetrics: GrowthMetric[];
}

export async function getDashboardChartData(): Promise<DashboardChartData> {
  const months = getLast6MonthLabels();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [leadsRaw, oppsRaw, accountsRaw, contactsRaw, stagesRaw, tasksRaw] = await Promise.all([
    prismadb.crm_Leads.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prismadb.crm_Opportunities.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prismadb.crm_Accounts.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prismadb.crm_Contacts.findMany({
      where: { cratedAt: { gte: sixMonthsAgo } },
      select: { cratedAt: true },
    }),
    prismadb.crm_Opportunities.findMany({
      select: {
        assigned_sales_stage: { select: { name: true } },
      },
    }),
    prismadb.tasks.findMany({
      select: { taskStatus: true },
    }),
  ]);

  const leadCounts = bucketByMonth(
    leadsRaw.map((r) => ({ createdAt: r.createdAt ?? null })),
    months
  );
  const oppCounts = bucketByMonth(
    oppsRaw.map((r) => ({ createdAt: r.createdAt })),
    months
  );
  const accountCounts = bucketByMonth(
    accountsRaw.map((r) => ({ createdAt: r.createdAt })),
    months
  );
  const contactCounts = bucketByMonth(
    contactsRaw.map((r) => ({ createdAt: r.cratedAt ?? null })),
    months
  );

  const monthlyTrend: MonthlyTrendPoint[] = months.map((m) => ({
    month: m.label,
    leads: leadCounts[m.label],
    opportunities: oppCounts[m.label],
    accounts: accountCounts[m.label],
    contacts: contactCounts[m.label],
  }));

  // Stage breakdown
  const stageCounts: Record<string, number> = {};
  stagesRaw.forEach((opp: any) => {
    const name = opp.assigned_sales_stage?.name ?? "Unknown";
    stageCounts[name] = (stageCounts[name] || 0) + 1;
  });

  const stageBreakdown: StageBreakdownPoint[] = Object.entries(stageCounts)
    .map(([stage, count]) => ({ stage, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Task status breakdown
  const taskStatusCounts: Record<string, number> = {};
  tasksRaw.forEach((task: any) => {
    const status = task.taskStatus ?? "UNKNOWN";
    taskStatusCounts[status] = (taskStatusCounts[status] || 0) + 1;
  });

  const taskStatus: TaskStatusPoint[] = Object.entries(taskStatusCounts).map(
    ([status, count]) => ({ status, count })
  );

  // Growth metrics (month-over-month change)
  const lastMonthLabel = months[months.length - 2]?.label;
  const thisMonthLabel = months[months.length - 1]?.label;

  const calculateMetric = (
    category: string,
    lastCount: number,
    thisCount: number
  ): GrowthMetric => {
    const change = thisCount - lastCount;
    const percentChange =
      lastCount === 0 ? (thisCount > 0 ? 100 : 0) : (change / lastCount) * 100;
    const trend = change > 0 ? "up" : change < 0 ? "down" : "neutral";

    return {
      category,
      lastMonth: lastCount,
      thisMonth: thisCount,
      change,
      percentChange: Math.round(percentChange),
      trend,
    };
  };

  const growthMetrics: GrowthMetric[] = [
    calculateMetric(
      "Leads",
      leadCounts[lastMonthLabel || ""] || 0,
      leadCounts[thisMonthLabel || ""] || 0
    ),
    calculateMetric(
      "Events",
      oppCounts[lastMonthLabel || ""] || 0,
      oppCounts[thisMonthLabel || ""] || 0
    ),
    calculateMetric(
      "Companies",
      accountCounts[lastMonthLabel || ""] || 0,
      accountCounts[thisMonthLabel || ""] || 0
    ),
    calculateMetric(
      "Contacts",
      contactCounts[lastMonthLabel || ""] || 0,
      contactCounts[thisMonthLabel || ""] || 0
    ),
  ];

  return { monthlyTrend, stageBreakdown, taskStatus, growthMetrics };
}
