import { prismadb } from "@/lib/prisma";

export const getMarketingCampaign = async (campaignId: string) => {
  try {
    const campaign = await prismadb.crm_marketing_campaigns.findUnique({
      where: {
        id: campaignId,
      },
      include: {
        createdBy: true,
      },
    });

    if (!campaign) return null;

    return {
      ...campaign,
      budget:
        campaign.budget &&
        typeof campaign.budget === "object" &&
        typeof campaign.budget.toNumber === "function"
          ? campaign.budget.toNumber()
          : campaign.budget ?? null,
      spent:
        campaign.spent &&
        typeof campaign.spent === "object" &&
        typeof campaign.spent.toNumber === "function"
          ? campaign.spent.toNumber()
          : campaign.spent ?? null,
      createdAt: campaign.createdAt
        ? new Date(campaign.createdAt).toISOString()
        : null,
    };
  } catch (error) {
    console.error("Error fetching marketing campaign:", error);
    return null;
  }
};