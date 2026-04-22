import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const deleteMarketingTemplate = async (templateId: string) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const deleted = await prismadb.email_templates.delete({
      where: { id: templateId },
    });

    return deleted;
  } catch (error) {
    console.error("Error deleting marketing template:", error);
    throw error;
  }
};
