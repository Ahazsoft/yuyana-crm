import { prismadb } from "@/lib/prisma";

export const getMarketingCampaign = async (campaignId: string) => {
  try {
    const campaign = await prismadb.crm_marketing_campaigns.findUnique({
      where: {
        id: campaignId,
      },
      include: {
        createdBy: true
      }
    });
    if (!campaign) return null;

    const normalized: any = {
      ...campaign,
      budget: campaign.budget && typeof campaign.budget === "object" && typeof campaign.budget.toNumber === "function" ? campaign.budget.toNumber() : campaign.budget ?? null,
      spent: campaign.spent && typeof campaign.spent === "object" && typeof campaign.spent.toNumber === "function" ? campaign.spent.toNumber() : campaign.spent ?? null,
      startDate: campaign.startDate ? (campaign.startDate instanceof Date ? campaign.startDate.toISOString() : campaign.startDate) : null,
      endDate: campaign.endDate ? (campaign.endDate instanceof Date ? campaign.endDate.toISOString() : campaign.endDate) : null,
      createdAt: campaign.createdAt ? (campaign.createdAt instanceof Date ? campaign.createdAt.toISOString() : campaign.createdAt) : null,
    };

    return normalized;
  } catch (error) {
    console.error("Error fetching marketing campaign:", error);
    return null;
  }
};