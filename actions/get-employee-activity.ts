import type { ReportTimeline } from "@/actions/employees/get-employee-charts";
import { prismadb } from "@/lib/prisma";

export interface EmployeeActivityEntry {
  id: string;
  type: "company" | "contact" | "lead" | "opportunity" | "contract";
  title: string;
  subtitle: string;
  status?: string | null;
  createdAt: Date | null;
  href: string;
}

interface DateRange {
  start: Date;
  end: Date;
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

function resolveRange(timeline: ReportTimeline, selected?: string): DateRange {
  if (timeline === "weekly") {
    const fallback = getCurrentWeekValue();
    const parsed = selected ? getWeekRangeFromSelection(selected) : null;
    if (parsed) {
      return parsed;
    }

    return getWeekRangeFromSelection(fallback) ?? getWeekRangeFromSelection(getCurrentWeekValue())!;
  }

  const fallback = getCurrentMonthValue();
  const parsed = selected ? getMonthRangeFromSelection(selected) : null;
  if (parsed) {
    return parsed;
  }

  return getMonthRangeFromSelection(fallback) ?? getMonthRangeFromSelection(getCurrentMonthValue())!;
}

export async function getEmployeeActivity(
  employeeId: string,
  options?: { timeline?: ReportTimeline; selected?: string }
) {
  const employee = await prismadb.users.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      userStatus: true,
      phone: true,
      created_on: true,
      lastLoginAt: true,
    },
  });

  if (!employee) {
    return null;
  }

  const range = resolveRange(options?.timeline ?? "monthly", options?.selected);

  const [accounts, contacts, leads, opportunities, contracts] = await Promise.all([
    prismadb.crm_Accounts.findMany({
      where: {
        createdBy: employeeId,
        createdAt: { gte: range.start, lte: range.end },
      },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prismadb.crm_Contacts.findMany({
      where: {
        createdBy: employeeId,
        cratedAt: { gte: range.start, lte: range.end },
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        status: true,
        cratedAt: true,
      },
      orderBy: { cratedAt: "desc" },
    }),
    prismadb.crm_Leads.findMany({
      where: {
        createdBy: employeeId,
        createdAt: { gte: range.start, lte: range.end },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        company: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prismadb.crm_Opportunities.findMany({
      where: {
        created_by: employeeId,
        createdAt: { gte: range.start, lte: range.end },
      },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prismadb.crm_Contracts.findMany({
      where: {
        createdBy: employeeId,
        createdAt: { gte: range.start, lte: range.end },
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activity: EmployeeActivityEntry[] = [
    ...accounts.map((account) => ({
      id: account.id,
      type: "company" as const,
      title: account.name,
      subtitle: "Account",
      status: account.status,
      createdAt: account.createdAt,
      href: `/crm/accounts/${account.id}`,
    })),
    ...contacts.map((contact) => ({
      id: contact.id,
      type: "contact" as const,
      title: `${contact.first_name} ${contact.last_name ?? ""}`.trim(),
      subtitle: "Contact",
      status: contact.status ? "Active" : "Inactive",
      createdAt: contact.cratedAt,
      href: `/crm/contacts/${contact.id}`,
    })),
    ...leads.map((lead) => ({
      id: lead.id,
      type: "lead" as const,
      title: `${lead.firstName} ${lead.lastName ?? ""}`.trim() || lead.company || "Lead",
      subtitle: lead.company ?? "Lead",
      status: lead.status,
      createdAt: lead.createdAt,
      href: `/crm/leads/${lead.id}`,
    })),
    ...opportunities.map((opportunity) => ({
      id: opportunity.id,
      type: "opportunity" as const,
      title: opportunity.name || "Opportunity",
      subtitle: "Opportunity",
      status: opportunity.status?.toString(),
      createdAt: opportunity.createdAt,
      href: `/crm/opportunities/${opportunity.id}`,
    })),
    ...contracts.map((contract) => ({
      id: contract.id,
      type: "contract" as const,
      title: contract.title,
      subtitle: "Contract",
      status: contract.status,
      createdAt: contract.createdAt,
      href: `/crm/contracts/${contract.id}`,
    })),
  ].sort((a, b) => {
    const first = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const second = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return second - first;
  });

  return {
    employee,
    activity,
  };
}
