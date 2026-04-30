import { prismadb } from "@/lib/prisma";

/**
 * Very small filter-to-prisma translator for MVP.
 * Supports filters as array of { field, operator, value } where operator: equals
 */
function buildWhereFromFilters(filters: any[]): any {
  const where: any = {};
  if (!Array.isArray(filters)) return where;

  for (const rule of filters) {
    const { field, operator, value } = rule as any;
    if (!field) continue;

    // Simple support for lead.status equals
    if (field === "status" && operator === "equals") {
      where.status = value;
    }

    // basic createdAt between
    if (field === "createdAt" && operator === "between" && Array.isArray(value) && value.length === 2) {
      where.createdAt = { gte: new Date(value[0]), lte: new Date(value[1]) };
    }
  }

  return where;
}

export const evaluateSegment = async (filters: any) => {
  const where = buildWhereFromFilters(filters || []);
  const leads = await prismadb.crm_Leads.findMany({ where, take: 500 });
  return { count: leads.length, sample: leads.slice(0, 50) };
};

export default evaluateSegment;
