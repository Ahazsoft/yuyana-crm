import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";
import resendHelper from "@/lib/resend";

interface SendCampaignEmailData {
  campaignId: string;
  recipients: string[];
}

export const sendCampaignEmail = async (data: SendCampaignEmailData) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const resend = await resendHelper();

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
          //@ts-ignore
          emailId: emailResponse.id,
        });
      } catch (emailError) {
        results.push({
          recipient,
          status: "failed",
          error: (emailError as Error).message,
        });
      }
    }

    await prismadb.crm_marketing_campaigns.update({
      where: { id: data.campaignId },
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