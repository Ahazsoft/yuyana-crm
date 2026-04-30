//@ts-nocheck
import { prismadb } from "@/lib/prisma";

function buildWhereFromFilters(filters: any[], target: string) {
  const where: any = {};
  if (!Array.isArray(filters)) return where;

  for (const rule of filters) {
    const { field, operator, value } = rule as any;
    if (!field) continue;

    if (target === "lead") {
      if (field === "status" && operator === "equals") where.status = value;
      if (field === "createdAt" && operator === "between" && Array.isArray(value) && value.length === 2) {
        where.createdAt = { gte: new Date(value[0]), lte: new Date(value[1]) };
      }
    }

    if (target === "contact") {
      if (field === "status" && operator === "equals") {
        // contact.status is boolean in schema
        where.status = value === "ACTIVE" ? true : false;
      }
    }
  }

  return where;
}

export const listSegments = async () => {
  const data = await prismadb.marketingSegment.findMany({
    orderBy: { createdAt: "desc" },
    include: { members: { select: { leadId: true } } },
  });

  // compute counts for each segment based on segmentationType and filters
  const enriched = await Promise.all(
    data.map(async (seg) => {
      let count = seg.members?.length || 0;
      const segType = (seg as any).segmentationType;

      // If no segmentationType, treat as static (keep member count)
      if (!segType) {
        console.log(`[DEBUG] Segment ${seg.id} - no segmentationType, using member count:`, count);
        return { ...seg, cachedCount: count };
      }

      try {
        if (segType === "LEAD") {
          if (seg.leadFilters) {
            const where = buildWhereFromFilters(seg.leadFilters as any[], "lead");
            console.log(`[DEBUG] Segment ${seg.id} (LEAD) - filters:`, seg.leadFilters, "where:", where);
            count = await prismadb.crm_Leads.count({ where });
          } else if (seg.members && seg.members.length > 0) {
            count = seg.members.length;
          }
        } else if (segType === "CONTACT") {
          if (seg.contactFilters) {
            const where = buildWhereFromFilters(seg.contactFilters as any[], "contact");
            console.log(`[DEBUG] Segment ${seg.id} (CONTACT) - filters:`, seg.contactFilters, "where:", where);
            count = await prismadb.crm_Contacts.count({ where });
          }
        } else if (segType === "ACCOUNT") {
          if (seg.accountFilters && Array.isArray(seg.accountFilters)) {
            // support companySize filter with raw SQL fallback for numeric comparison
            const rule = seg.accountFilters[0];
            if (rule?.field === "companySize" && rule?.operator === "equals") {
              const v = rule.value;
              console.log(`[DEBUG] Segment ${seg.id} (ACCOUNT) - companySize filter:`, v);
              if (v === "SMALL") {
                const res: any = await prismadb.$queryRaw`
                  SELECT COUNT(*)::int AS c FROM "crm_Accounts" WHERE (CASE WHEN employees ~ '^\\d+$' THEN CAST(employees AS integer) ELSE NULL END) < 50
                `;
                count = Number(res[0]?.c ?? 0);
              } else if (v === "MEDIUM") {
                const res: any = await prismadb.$queryRaw`
                  SELECT COUNT(*)::int AS c FROM "crm_Accounts" WHERE (CASE WHEN employees ~ '^\\d+$' THEN CAST(employees AS integer) ELSE NULL END) BETWEEN 50 AND 250
                `;
                count = Number(res[0]?.c ?? 0);
              } else if (v === "LARGE") {
                const res: any = await prismadb.$queryRaw`
                  SELECT COUNT(*)::int AS c FROM "crm_Accounts" WHERE (CASE WHEN employees ~ '^\\d+$' THEN CAST(employees AS integer) ELSE NULL END) > 250
                `;
                count = Number(res[0]?.c ?? 0);
              }
            } else {
              // fallback: total accounts
              count = await prismadb.crm_Accounts.count();
            }
          } else {
            count = await prismadb.crm_Accounts.count();
          }
        }

        console.log(`[DEBUG] Segment ${seg.id} final count:`, count);
      } catch (e) {
        console.log("[SEGMENT_COUNT_ERR]", e);
      }

      return { ...seg, cachedCount: count };
    })
  );

  return enriched;
};

export default listSegments;