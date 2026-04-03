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
    
    return campaigns;
  } catch (error) {
    console.error("Error fetching marketing campaigns:", error);
    return [];
  }
};