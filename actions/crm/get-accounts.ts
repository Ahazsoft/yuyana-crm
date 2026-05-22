import { cache } from "react";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getAccounts = cache(async () => {
  const data = await prismadb.crm_Accounts.findMany({
    include: {
      assigned_to_user: {
        select: {
          name: true,
        },
      },
      contacts: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
      // Watchers relationship through AccountWatchers junction table
      watchers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return data;
});

export const getMyOwnAccounts = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    return [];
  }
  const data = await prismadb.crm_Accounts.findMany({
    include: {
      assigned_to_user: {
        select: {
          name: true,
        },
      },
      contacts: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
      watchers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    where: {
      OR: [
        { assigned_to: session.user.id },
        { createdBy: session.user.id },
      ],
    },
  });
  return data;
});
