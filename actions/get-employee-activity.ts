import { prismadb } from "@/lib/prisma";

export interface EmployeeActivityEntry {
  id: string;
  type: "account" | "contact" | "lead" | "opportunity" | "contract";
  title: string;
  subtitle: string;
  status?: string | null;
  createdAt: Date | null;
  href: string;
}

export async function getEmployeeActivity(employeeId: string) {
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

  const [accounts, contacts, leads, opportunities, contracts] = await Promise.all([
    prismadb.crm_Accounts.findMany({
      where: { createdBy: employeeId },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prismadb.crm_Contacts.findMany({
      where: { createdBy: employeeId },
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
      where: { createdBy: employeeId },
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
      where: { created_by: employeeId },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prismadb.crm_Contracts.findMany({
      where: { createdBy: employeeId },
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
      type: "account" as const,
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
