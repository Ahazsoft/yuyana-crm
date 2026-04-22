import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface CreateMarketingTemplateData {
  title: string;
  subtitle?: string;
  subject?: string;
  body?: any; // tiptap JSON
}

export const createMarketingTemplate = async (data: CreateMarketingTemplateData) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const template = await prismadb.email_templates.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        subject: data.subject,
        body: data.body,
        createdBy: session.user.id,
      },
    });

    return template;
  } catch (error) {
    console.error("Error creating marketing template:", error);
    throw error;
  }
};
