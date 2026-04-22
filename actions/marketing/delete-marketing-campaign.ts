import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSafeAction } from "@/lib/create-safe-action";
import { z } from "zod";

const InputType = z.object({
  id: z.string().min(1, "Campaign ID is required"),
});

type InputType = z.infer<typeof InputType>;
type ReturnType = {
  success?: boolean;
  error?: string;
};

export const deleteMarketingCampaign = createSafeAction(
  InputType,
  async (data) => {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { error: "User not authenticated" };
    }

    try {
      await prismadb.crm_marketing_campaigns.delete({
        where: {
          id: data.id,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("[DELETE_MARKETING_CAMPAIGN]", error);
      return { error: "Failed to delete marketing campaign" };
    }
  }
);