import { prismadb } from "@/lib/prisma";

export const getMarketingTemplates = async () => {
  try {
    const templates = await prismadb.email_templates.findMany({
      orderBy: { createdAt: "desc" },
      include: { created_by_user: true }
    });

    return templates;
  } catch (error) {
    console.error("Error fetching marketing templates:", error);
    return [];
  }
};
