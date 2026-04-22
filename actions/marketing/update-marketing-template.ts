import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface UpdateMarketingTemplateData {
  id: string;
  title?: string;
  subtitle?: string;
  subject?: string;
  body?: any;
}

export const updateMarketingTemplate = async (data: UpdateMarketingTemplateData) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const template = await prismadb.email_templates.update({
      where: { id: data.id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        subject: data.subject,
        body: data.body,
        // `updatedAt` will be managed by Prisma `@updatedAt`
      },
    });

    return template;
  } catch (error) {
    console.error("Error updating marketing template:", error);
    throw error;
  }
};
