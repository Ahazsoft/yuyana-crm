import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface UpdateMarketingCampaignData {
  id: string;
  name?: string;
  description?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  spent?: number;
  emailSubject?: string;
  emailContent?: string;
  targetAudience?: any; // JSON type
  sentCount?: number;
  openCount?: number;
  clickCount?: number;
  conversionCount?: number;
}

export const updateMarketingCampaign = async (data: UpdateMarketingCampaignData) => {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }
    
    const updateData: any = {
      name: data.name,
      description: data.description,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
      budget: data.budget ? new Number(data.budget).toString() as any : undefined,
      spent: data.spent ? new Number(data.spent).toString() as any : undefined,
      emailSubject: data.emailSubject,
      emailContent: data.emailContent,
      targetAudience: data.targetAudience,
      sentCount: data.sentCount,
      openCount: data.openCount,
      clickCount: data.clickCount,
      conversionCount: data.conversionCount,
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    const campaign = await prismadb.crm_marketing_campaigns.update({
      where: {
        id: data.id,
      },
      data: updateData,
    });
    
    return campaign;
  } catch (error) {
    console.error("Error updating marketing campaign:", error);
    throw error;
  }
};