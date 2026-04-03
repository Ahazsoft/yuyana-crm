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
    
    return campaign;
  } catch (error) {
    console.error("Error fetching marketing campaign:", error);
    return null;
  }
};