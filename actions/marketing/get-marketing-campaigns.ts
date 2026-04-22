import { prismadb } from "@/lib/prisma";

export const getMarketingCampaigns = async () => {
  try {
    const campaigns = await prismadb.crm_marketing_campaigns.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        createdBy: true
      }
    });
    // Normalize Prisma Decimal and Date objects to plain JSON-serializable values
    const normalized = campaigns.map((c: any) => ({
      ...c,
      budget: c.budget && typeof c.budget === "object" && typeof c.budget.toNumber === "function" ? c.budget.toNumber() : c.budget ?? null,
      spent: c.spent && typeof c.spent === "object" && typeof c.spent.toNumber === "function" ? c.spent.toNumber() : c.spent ?? null,
      startDate: c.startDate ? (c.startDate instanceof Date ? c.startDate.toISOString() : c.startDate) : null,
      endDate: c.endDate ? (c.endDate instanceof Date ? c.endDate.toISOString() : c.endDate) : null,
      createdAt: c.createdAt ? (c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt) : null,
    }));

    return normalized;
  } catch (error) {
    console.error("Error fetching marketing campaigns:", error);
    return [];
  }
};