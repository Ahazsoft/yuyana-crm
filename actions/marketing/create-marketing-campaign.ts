import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface CreateMarketingCampaignData {
  name: string;
  description?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  emailSubject?: string;
  emailContent?: string;
  targetAudience?: any; // JSON type
}

export const createMarketingCampaign = async (data: CreateMarketingCampaignData) => {
  try {
    // Get the current session to identify the creator
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }
    
    const campaign = await prismadb.crm_marketing_campaigns.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status || "DRAFT",
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget ? new Number(data.budget).toString() as any : null,
        emailSubject: data.emailSubject,
        emailContent: data.emailContent,
        targetAudience: data.targetAudience,
        createdById: session.user.id,
      },
    });
    
    return campaign;
  } catch (error) {
    console.error("Error creating marketing campaign:", error);
    throw error;
  }
};