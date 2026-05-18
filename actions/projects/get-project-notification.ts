
// lib/notifications.ts
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getUnreadNotificationCounts() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // Fetch all unread notifications for this user
  const notifications = await prismadb.notifications.findMany({
    where: {
      receiverId: session.user.id,
      isSeen: false,
      category: {
        in: ["Leads", "Accounts", "Contacts", "Contracts", "Opportunities", "Projects"],
      },
    },
    select: {
      category: true,
      subCategory: true,
    },
  });

  // Count by category and task subcategory
  const counts: Record<string, number> = {};
  notifications.forEach((n) => {
    counts[n.category] = (counts[n.category] || 0) + 1;

    if (n.category === "Projects" && n.subCategory === "Tasks") {
      counts["Tasks"] = (counts["Tasks"] || 0) + 1;
    }
  });

  return counts;
}
