import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";
import { resend } from "@/lib/resend";

interface SendCampaignEmailData {
  campaignId: string;
  recipients: string[]; // Array of email addresses
}

export const sendCampaignEmail = async (data: SendCampaignEmailData) => {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }
    
    // Fetch the campaign details
    const campaign = await prismadb.crm_marketing_campaigns.findUnique({
      where: {
        id: data.campaignId,
      },
    });
    
    if (!campaign) {
      throw new Error("Campaign not found");
    }
    
    if (!campaign.emailSubject || !campaign.emailContent) {
      throw new Error("Campaign must have subject and content");
    }
    
    // Send emails to all recipients
    const results = [];
    for (const recipient of data.recipients) {
      try {
        const emailResponse = await resend.emails.send({
          from: process.env.RESEND_EMAIL_FROM || "onboarding@resend.dev",
          to: recipient,
          subject: campaign.emailSubject,
          html: campaign.emailContent,
        });
        
        results.push({
          recipient,
          status: "sent",
          emailId: emailResponse.id,
        });
      } catch (emailError) {
        console.error(`Failed to send email to ${recipient}:`, emailError);
        results.push({
          recipient,
          status: "failed",
          error: (emailError as Error).message,
        });
      }
    }
    
    // Update campaign stats
    await prismadb.crm_marketing_campaigns.update({
      where: {
        id: data.campaignId,
      },
      data: {
        sentCount: {
          increment: data.recipients.length,
        },
        updatedAt: new Date(),
      },
    });
    
    return {
      totalRecipients: data.recipients.length,
      results,
    };
  } catch (error) {
    console.error("Error sending campaign email:", error);
    throw error;
  }
};