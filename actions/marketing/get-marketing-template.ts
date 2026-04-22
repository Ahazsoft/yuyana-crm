import { prismadb } from "@/lib/prisma";

export const getMarketingTemplate = async (templateId: string) => {
  try {
    const template = await prismadb.email_templates.findUnique({
      where: { id: templateId },
      include: { created_by_user: true }
    });

    return template;
  } catch (error) {
    console.error("Error fetching marketing template:", error);
    return null;
  }
};
